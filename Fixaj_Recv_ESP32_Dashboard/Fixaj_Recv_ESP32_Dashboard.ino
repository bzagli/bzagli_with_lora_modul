/*
  Fixaj E22 LoRa ALICI - ESP32 + WiFi DASHBOARD
  - LoRa'dan gelen sicaklik/nem degerlerini okur
  - Min / Max degerleri tutar (sifirlanabilir)
  - ESP32 icindeki web sunucusundan canli dashboard sunar
  - Son olcumu belirli araliklarla web sitesine (meteo.html 3. istasyon) gonderir

  Acilis: Seri Port Ekrani (115200) IP adresini yazar. Tarayicida o adresi
  (veya http://lora-alici.local) acin. WiFi'ye baglanamazsa ESP32 kendi agini
  kurar: "LoRa-Alici" / sifre "12345678"  ->  http://192.168.4.1

  Baglanti (ESP32 <-> E22):  GPIO16<-TXD  GPIO17->RXD  GPIO25->M0  GPIO26->M1  GPIO27<-AUX
  Kutuphaneler: "EByte LoRa E22 library" (xreef), LiquidCrystal_I2C.
  WiFi.h, WebServer.h, ESPmDNS.h ESP32 paketiyle gelir, ayrica kurmaya gerek yok.
*/

#include "LoRa_E22.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ---------------- WiFi ----------------
const char* WIFI_SSID  = "WIFI_ADINIZ";      // <-- kendi ag adiniz
const char* WIFI_SIFRE = "WIFI_SIFRENIZ";    // <-- kendi sifreniz
const char* AP_SSID    = "LoRa-Alici";       // WiFi yoksa ESP32'nin kuracagi ag
const char* AP_SIFRE   = "12345678";

// ---------------- WEB SITESI (3. istasyon) ----------------
// Olcumler bu adrese POST edilir (temp, hum, konum). Bos birakilirsa gonderim kapali olur.
const char* SITE_URL = "https://bzagli.com/api/fixaj_api.php";
const unsigned long GONDERIM_ARALIGI_MS = 60000UL;  // en fazla dakikada bir gonderim

// ---------------- PINLER ----------------
#define E22_RX_PIN 16
#define E22_TX_PIN 17
#define M0_PIN     25
#define M1_PIN     26
#define AUX_PIN    27

// ---------------- LoRa PARAMETRELERI ----------------
#define Adres 2
#define Kanal 20
#define Netid 63

#define LCD_VAR 1  // I2C LCD yoksa 0

LoRa_E22 FixajSS(E22_RX_PIN, E22_TX_PIN, &Serial2, AUX_PIN, M0_PIN, M1_PIN, UART_BPS_RATE_9600);
WebServer server(80);

#if LCD_VAR
LiquidCrystal_I2C lcd(0x27, 16, 2);
#endif

struct __attribute__((packed)) Signal {
  char sifre[15];
  char konum[15];
  bool btn1;
  byte btn2[10];      // ilk 4 bayt: float sicaklik
  int16_t hmdty[10];  // hmdty[0]: nem x 10 (vericide Uno int = 2 bayt)
};
static_assert(sizeof(Signal) == 61, "Signal boyutu vericiyle (61 bayt) ayni olmali");

#define NEM_MIN 3.0f  // Bunun altindaki nem DHT22 arizasi sayilir (sabit %1 sorunu)

// ---------------- OLCUM VERILERI ----------------
unsigned long paketSayisi = 0;
unsigned long sonPaketMs = 0;
unsigned long sonNabiz = 0;
float sonSicaklik = NAN, sonNem = NAN;
float minSicaklik = NAN, maxSicaklik = NAN;
float minNem = NAN, maxNem = NAN;
char sonKonum[16] = "-";

// ---------------- SITE GONDERIM DURUMU ----------------
unsigned long sonGonderimMs = 0;
unsigned long gonderilenPaket = 0;   // siteye en son gonderilen paket numarasi
int sonHttpKodu = 0;

void minMaxSifirla() {
  minSicaklik = maxSicaklik = sonSicaklik;
  minNem = maxNem = sonNem;
}

void minMaxGuncelle(float t, float h) {
  if (isnan(minSicaklik) || t < minSicaklik) minSicaklik = t;
  if (isnan(maxSicaklik) || t > maxSicaklik) maxSicaklik = t;
  if (isnan(minNem) || h < minNem) minNem = h;
  if (isnan(maxNem) || h > maxNem) maxNem = h;
}

// ---------------- DASHBOARD SAYFASI ----------------
const char DASHBOARD_HTML[] PROGMEM = R"rawliteral(
<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LoRa Alici</title>
<style>
:root{--bg:#f4f6f8;--card:#fff;--tx:#1d2733;--mut:#6b7785;--t:#e4572e;--h:#2e86de;--ok:#2a9d5c;--bad:#c0392b;--line:#e3e7ec}
@media(prefers-color-scheme:dark){:root{--bg:#12161b;--card:#1c2229;--tx:#e8edf2;--mut:#94a0ad;--line:#2b333c}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.wrap{max-width:900px;margin:0 auto;padding:16px}
header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px}
h1{font-size:20px;margin:0}.st{font-size:13px;color:var(--mut)}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:var(--bad)}
.dot.on{background:var(--ok)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.lbl{font-size:13px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}
.big{font-size:44px;font-weight:700;margin:4px 0 10px;font-variant-numeric:tabular-nums}
.t .big{color:var(--t)}.h .big{color:var(--h)}
.mm{display:flex;gap:10px}.mm div{flex:1;background:var(--bg);border-radius:8px;padding:8px 10px}
.mm span{display:block;font-size:12px;color:var(--mut)}.mm b{font-size:20px;font-variant-numeric:tabular-nums}
canvas{width:100%;height:220px;display:block}
.info{display:flex;flex-wrap:wrap;gap:16px;font-size:14px;color:var(--mut);margin-top:12px}
button{background:var(--tx);color:var(--bg);border:0;border-radius:8px;padding:9px 14px;font-size:14px;cursor:pointer}
.leg{font-size:13px;color:var(--mut);margin-bottom:6px}.leg i{display:inline-block;width:10px;height:3px;margin:0 4px 3px 10px;vertical-align:middle}
</style></head><body><div class="wrap">
<header><div><h1>LoRa Alıcı Dashboard</h1><div class="st"><span id="dot" class="dot"></span><span id="durum">Bağlanıyor…</span></div></div>
<button onclick="sifirla()">Min/Max sıfırla</button></header>
<div class="grid">
 <div class="card t"><div class="lbl">Sıcaklık</div><div class="big" id="t">--</div>
  <div class="mm"><div><span>Min</span><b id="tmin">--</b></div><div><span>Max</span><b id="tmax">--</b></div></div></div>
 <div class="card h"><div class="lbl">Nem</div><div class="big" id="h">--</div>
  <div class="mm"><div><span>Min</span><b id="hmin">--</b></div><div><span>Max</span><b id="hmax">--</b></div></div></div>
</div>
<div class="card" style="margin-top:12px"><div class="leg">Son ölçümler<i style="background:var(--t)"></i>Sıcaklık (°C)<i style="background:var(--h)"></i>Nem (%)</div>
<canvas id="c"></canvas></div>
<div class="info"><div>Konum: <b id="konum">-</b></div><div>Paket: <b id="paket">0</b></div><div>Son paket: <b id="yas">-</b></div></div>
</div>
<script>
const N=120, T=[], H=[];
const f=(v,u)=>v===null?'--':v.toFixed(1)+u;
function ciz(){
 const c=document.getElementById('c'),d=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
 c.width=w*d;c.height=h*d;const x=c.getContext('2d');x.scale(d,d);x.clearRect(0,0,w,h);
 const cs=getComputedStyle(document.documentElement);
 const seri=(a,col,ex)=>{if(a.length<1)return;let lo=Math.min(...a),hi=Math.max(...a);if(hi-lo<1){lo-=.5;hi+=.5}
  x.strokeStyle=col;x.lineWidth=2;x.beginPath();
  a.forEach((v,i)=>{const px=8+i*(w-16)/(N-1),py=h-10-(v-lo)/(hi-lo)*(h-30);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();
  x.fillStyle=col;x.font='12px system-ui';x.textAlign='right';x.fillText('max '+hi.toFixed(1)+ex+'  min '+lo.toFixed(1)+ex,w-8,ex=='°C'?14:28);};
 seri(T,cs.getPropertyValue('--t'),'°C');seri(H,cs.getPropertyValue('--h'),'%');
}
async function guncelle(){
 try{
  const r=await fetch('/data',{cache:'no-store'}),j=await r.json();
  document.getElementById('t').textContent=f(j.t,' °C');document.getElementById('h').textContent=f(j.h,' %');
  document.getElementById('tmin').textContent=f(j.tmin,'°');document.getElementById('tmax').textContent=f(j.tmax,'°');
  document.getElementById('hmin').textContent=f(j.hmin,'%');document.getElementById('hmax').textContent=f(j.hmax,'%');
  document.getElementById('konum').textContent=j.konum;document.getElementById('paket').textContent=j.paket;
  const canli=j.yas>=0&&j.yas<15;
  document.getElementById('yas').textContent=j.yas<0?'-':j.yas+' sn önce';
  document.getElementById('dot').className='dot'+(canli?' on':'');
  document.getElementById('durum').textContent=canli?'Veri geliyor':'Verici sessiz';
  if(j.paket!==guncelle.son&&j.t!==null){T.push(j.t);H.push(j.h);if(T.length>N){T.shift();H.shift()}guncelle.son=j.paket;ciz();}
 }catch(e){document.getElementById('dot').className='dot';document.getElementById('durum').textContent='ESP32 ile bağlantı yok';}
}
async function sifirla(){await fetch('/reset',{method:'POST'});guncelle();}
addEventListener('resize',ciz);guncelle();setInterval(guncelle,2000);
</script></body></html>
)rawliteral";

String jsonSayi(float v) { return isnan(v) ? String("null") : String(v, 1); }

void handleRoot() { server.send_P(200, "text/html; charset=utf-8", DASHBOARD_HTML); }

void handleData() {
  long yas = sonPaketMs == 0 ? -1 : (long)((millis() - sonPaketMs) / 1000);
  String j = "{";
  j += "\"t\":" + jsonSayi(sonSicaklik);
  j += ",\"h\":" + jsonSayi(sonNem);
  j += ",\"tmin\":" + jsonSayi(minSicaklik);
  j += ",\"tmax\":" + jsonSayi(maxSicaklik);
  j += ",\"hmin\":" + jsonSayi(minNem);
  j += ",\"hmax\":" + jsonSayi(maxNem);
  j += ",\"paket\":" + String(paketSayisi);
  j += ",\"yas\":" + String(yas);
  j += ",\"site\":" + String(sonHttpKodu);
  j += ",\"konum\":\"" + String(sonKonum) + "\"}";
  server.send(200, "application/json", j);
}

void handleReset() {
  minMaxSifirla();
  server.send(200, "application/json", "{\"ok\":true}");
}

void wifiBaslat() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_SIFRE);
  Serial.print("WiFi'ye baglaniliyor");
  unsigned long bas = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - bas < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  String ip;
  if (WiFi.status() == WL_CONNECTED) {
    ip = WiFi.localIP().toString();
    Serial.print("WiFi bagli. Dashboard: http://");
    Serial.println(ip);
  } else {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_SIFRE);
    ip = WiFi.softAPIP().toString();
    Serial.print("WiFi yok, kendi agi kuruldu: ");
    Serial.print(AP_SSID);
    Serial.print("  Dashboard: http://");
    Serial.println(ip);
  }
  if (MDNS.begin("lora-alici")) Serial.println("Ya da: http://lora-alici.local");

#if LCD_VAR
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dashboard IP:");
  lcd.setCursor(0, 1);
  lcd.print(ip);
#endif

  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.on("/reset", HTTP_POST, handleReset);
  server.begin();
}

bool LoraE22Ayarlar() {
  ResponseStructContainer c = FixajSS.getConfiguration();
  if (c.status.code != E22_SUCCESS) {
    Serial.print("Ayar okunamadi: ");
    Serial.println(c.status.getResponseDescription());
    c.close();
    return false;
  }
  Configuration configuration = *(Configuration*)c.data;
  c.close();

  configuration.ADDL  = lowByte(Adres);
  configuration.ADDH  = highByte(Adres);
  configuration.NETID = Netid;
  configuration.CHAN  = Kanal;
  configuration.SPED.airDataRate         = AIR_DATA_RATE_010_24;
  configuration.OPTION.subPacketSetting  = SPS_240_00;
  configuration.OPTION.transmissionPower = POWER_22;
  configuration.SPED.uartBaudRate  = UART_BPS_9600;
  configuration.SPED.uartParity    = MODE_00_8N1;
  configuration.TRANSMISSION_MODE.WORPeriod             = WOR_2000_011;
  configuration.OPTION.RSSIAmbientNoise                 = RSSI_AMBIENT_NOISE_DISABLED;
  configuration.TRANSMISSION_MODE.WORTransceiverControl = WOR_RECEIVER;
  configuration.TRANSMISSION_MODE.enableRSSI            = RSSI_DISABLED;
  configuration.TRANSMISSION_MODE.fixedTransmission     = FT_FIXED_TRANSMISSION;
  configuration.TRANSMISSION_MODE.enableRepeater        = REPEATER_DISABLED;
  configuration.TRANSMISSION_MODE.enableLBT             = LBT_DISABLED;

  ResponseStatus rs = FixajSS.setConfiguration(configuration, WRITE_CFG_PWR_DWN_SAVE);
  Serial.print("Ayar yazma: ");
  Serial.println(rs.getResponseDescription());
  return rs.code == E22_SUCCESS;
}

String urlKodla(const char* s) {
  String out;
  const char* hex = "0123456789ABCDEF";
  for (; *s; s++) {
    unsigned char c = (unsigned char)*s;
    if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') out += (char)c;
    else { out += '%'; out += hex[c >> 4]; out += hex[c & 15]; }
  }
  return out;
}

// Son olcumu web sitesine gonderir. Sadece ev WiFi'sine bagliyken calisir.
void siteyeGonder() {
  if (SITE_URL[0] == 0 || WiFi.getMode() != WIFI_STA || WiFi.status() != WL_CONNECTED) return;
  if (paketSayisi == 0 || paketSayisi == gonderilenPaket || isnan(sonSicaklik)) return;
  if (sonGonderimMs != 0 && millis() - sonGonderimMs < GONDERIM_ARALIGI_MS) return;
  sonGonderimMs = millis();

  WiFiClientSecure istemci;
  istemci.setInsecure();  // sertifika dogrulamasi yok (basitlik icin)
  HTTPClient http;
  http.setTimeout(5000);
  if (!http.begin(istemci, SITE_URL)) {
    Serial.println("Site: baglanti baslatilamadi");
    sonHttpKodu = -1;
    return;
  }
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  String govde = "temp=" + String(sonSicaklik, 1) + "&hum=" + String(sonNem, 1) + "&konum=" + urlKodla(sonKonum);
  sonHttpKodu = http.POST(govde);
  if (sonHttpKodu == 200) {
    gonderilenPaket = paketSayisi;
    Serial.println("Site: olcum gonderildi");
  } else {
    Serial.print("Site: gonderim hatasi, kod=");
    Serial.println(sonHttpKodu);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\n=== ESP32 LoRa Alici + Dashboard ===");

#if LCD_VAR
  Wire.begin(21, 22);
  lcd.begin();   // fdebrabander kutuphanesi (johnrickman surumunde lcd.init())
  lcd.backlight();
  lcd.print("LoRa Alici");
#endif

  FixajSS.begin();
  delay(500);
  if (!LoraE22Ayarlar()) {
    Serial.println("UYARI: E22 ayarlanamadi. Kablolari kontrol edin.");
  }
  FixajSS.setMode(MODE_0_NORMAL);

  wifiBaslat();
  Serial.println("Hazir, paket bekleniyor...");
}

void paketOku() {
  ResponseStructContainer rsc = FixajSS.receiveMessage(sizeof(Signal));
  if (rsc.status.code != E22_SUCCESS) {
    Serial.print("Alma hatasi: ");
    Serial.println(rsc.status.getResponseDescription());
    rsc.close();
    return;
  }
  Signal data;
  memcpy(&data, rsc.data, sizeof(Signal));
  rsc.close();
  data.sifre[sizeof(data.sifre) - 1] = 0;
  data.konum[sizeof(data.konum) - 1] = 0;

  if (strcmp(data.sifre, "Fixaj.com") != 0) {
    Serial.println("Sifre uyusmadi / bozuk paket");
    return;
  }

  float sicaklik;
  memcpy(&sicaklik, data.btn2, sizeof(sicaklik));
  int16_t nemX10;
  memcpy(&nemX10, &data.hmdty[0], sizeof(nemX10));
  float nem = nemX10 / 10.0;

  // Mantiksiz degerleri min/max'a katma (bozuk paket korumasi)
  if (isnan(sicaklik) || sicaklik < -40 || sicaklik > 125 || nem < NEM_MIN || nem > 100) {
    Serial.println("Gecersiz deger, atlandi");
    return;
  }

  paketSayisi++;
  sonPaketMs = millis();
  sonSicaklik = sicaklik;
  sonNem = nem;
  strncpy(sonKonum, data.konum, sizeof(sonKonum) - 1);
  minMaxGuncelle(sicaklik, nem);

  Serial.print("[");  Serial.print(data.konum);  Serial.print("] #");  Serial.print(paketSayisi);
  Serial.print("  T="); Serial.print(sicaklik, 1);
  Serial.print(" C (min "); Serial.print(minSicaklik, 1); Serial.print(" / max "); Serial.print(maxSicaklik, 1);
  Serial.print(")  H=%"); Serial.print(nem, 1);
  Serial.print(" (min "); Serial.print(minNem, 1); Serial.print(" / max "); Serial.print(maxNem, 1);
  Serial.println(")");

#if LCD_VAR
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:"); lcd.print(sicaklik, 1);
  lcd.print(" H:"); lcd.print(nem, 1);
  lcd.setCursor(0, 1);
  lcd.print(minSicaklik, 0); lcd.print("/"); lcd.print(maxSicaklik, 0);
  lcd.print("C ");
  lcd.print(minNem, 0); lcd.print("/"); lcd.print(maxNem, 0); lcd.print("%");
#endif
}

void loop() {
  server.handleClient();

  if (FixajSS.available() > 0) paketOku();

  siteyeGonder();

  if (millis() - sonNabiz > 10000UL) {
    sonNabiz = millis();
    Serial.print("[nabiz] paket=");
    Serial.print(paketSayisi);
    Serial.print("  IP=");
    Serial.println(WiFi.getMode() == WIFI_AP ? WiFi.softAPIP() : WiFi.localIP());
  }
}
