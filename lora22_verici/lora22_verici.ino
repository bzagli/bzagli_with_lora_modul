/*
 * VERICI - Arduino Uno + DHT22 + E22
 * Kutuphaneler (Kutuphane Yoneticisi):
 *   - "EByte LoRa E22 library" (Renzo Mischianti)  -> LoRa_E22.h
 *   - "DHT sensor library" (Adafruit) + "Adafruit Unified Sensor"
 *
 * Pinler: E22 TXD->D3, E22 RXD->D4 (1k/2k gerilim bolucu ile!), M0->D7, M1->D6,
 *         AUX->D5 (sadece tani), VCC->5V, GND->GND
 *         DHT22 DATA->D2 (+10k pull-up 5V'a), VCC->5V, GND->GND
 *
 * Alici ile AYNI olmasi gerekenler: Kanal, Netid, HAVA_HIZI, SIFRE, Signal struct'i.
 */
#include <SoftwareSerial.h>
#include "LoRa_E22.h"
#include <DHT.h>

// ---------- Ayarlar ----------
#define AYARLARI_YAZ  0      // 1: acilista E22 ayarlarini yaz (ilk kurulum). Calisinca 0 yapip tekrar yukle.
#define Adres         1      // VERICI adresi (alicidan farkli)
#define GonderilecekAdres 2  // ALICI adresi
#define Kanal         20     // 0-80, alici ile AYNI. 400 MHz: 410+kanal, 900 MHz: 850+kanal
#define Netid         63     // alici ile AYNI

// Hava hizi (alici ile AYNI olmali):
//   AIR_DATA_RATE_010_24 : 2,4k  -> paket ~0,3 sn, onerilen baslangic
//   AIR_DATA_RATE_000_03 : 0,3k  -> en uzun menzil, paket birkac saniye (aralik >= 5 sn)
#define HAVA_HIZI  AIR_DATA_RATE_010_24
#define GONDERME_ARALIGI_MS 5000UL
#define SIFRE  "Fixaj.com"
#define KONUM  "Nigde"
#define NEM_MIN 3.0f   // Bunun altindaki nem DHT22 arizasi sayilir, gonderilmez (sabit %1 sorunu)

#define DHT_PIN 2
#define M0 7
#define M1 6
#define AUX_PIN 5

SoftwareSerial mySerial(3, 4);     // RX=D3 (E22 TXD), TX=D4 (E22 RXD)
LoRa_E22 FixajSS(&mySerial);
DHT dht(DHT_PIN, DHT22);

// Alici ile bayt bayta ayni (61 bayt). Uno'da int=2 bayt.
struct Signal {
  char sifre[15];
  char konum[15];
  bool btn1;
  byte btn2[10];    // ilk 4 bayt: float sicaklik (C)
  int  hmdty[10];   // hmdty[0]: nem x10 (551 = %55.1)
};

unsigned long sonGonderim = 0;

void LoraE22Ayarlar() {
  digitalWrite(M0, LOW);
  digitalWrite(M1, HIGH);          // ayar modu
  delay(100);

  ResponseStructContainer c = FixajSS.getConfiguration();
  if (c.status.code != E22_SUCCESS) {
    Serial.print(F("Ayar okunamadi: "));
    Serial.println(c.status.getResponseDescription());
    c.close();
    return;
  }
  Configuration configuration = *(Configuration*)c.data;

  configuration.ADDL = lowByte(Adres);
  configuration.ADDH = highByte(Adres);
  configuration.NETID = Netid;
  configuration.CHAN = Kanal;

  configuration.SPED.airDataRate = HAVA_HIZI;
  configuration.OPTION.subPacketSetting = SPS_240_00;
  configuration.OPTION.transmissionPower = POWER_22;
  configuration.SPED.uartBaudRate = UART_BPS_9600;
  configuration.SPED.uartParity = MODE_00_8N1;
  configuration.TRANSMISSION_MODE.WORPeriod = WOR_2000_011;
  configuration.OPTION.RSSIAmbientNoise = RSSI_AMBIENT_NOISE_DISABLED;
  configuration.TRANSMISSION_MODE.WORTransceiverControl = WOR_TRANSMITTER;
  configuration.TRANSMISSION_MODE.enableRSSI = RSSI_DISABLED;
  configuration.TRANSMISSION_MODE.fixedTransmission = FT_FIXED_TRANSMISSION;
  configuration.TRANSMISSION_MODE.enableRepeater = REPEATER_DISABLED;
  configuration.TRANSMISSION_MODE.enableLBT = LBT_DISABLED;

  ResponseStatus rs = FixajSS.setConfiguration(configuration, WRITE_CFG_PWR_DWN_SAVE);
  Serial.print(F("Ayar yazma: "));
  Serial.println(rs.getResponseDescription());
  c.close();
}

void setup() {
  Serial.begin(9600);
  pinMode(M0, OUTPUT);
  pinMode(M1, OUTPUT);
  pinMode(AUX_PIN, INPUT);
  digitalWrite(M0, LOW);
  digitalWrite(M1, LOW);

  Serial.println(F("\n=== Verici basliyor ==="));
  Serial.print(F("sizeof(Signal) = "));
  Serial.println(sizeof(Signal));   // 61 olmali

  dht.begin();
  FixajSS.begin();
  delay(500);

#if AYARLARI_YAZ
  LoraE22Ayarlar();
#endif

  digitalWrite(M0, LOW);            // normal mod
  digitalWrite(M1, LOW);
  delay(500);
  Serial.print(F("Hazir. AUX="));
  Serial.println(digitalRead(AUX_PIN));
}

void loop() {
  if (millis() - sonGonderim < GONDERME_ARALIGI_MS) return;
  sonGonderim = millis();

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (isnan(t) || isnan(h)) {
    Serial.println(F("DHT22 okunamadi! Kablo ve pull-up direncini kontrol edin."));
    return;
  }
  if (h < NEM_MIN || h > 100.0f) {
    Serial.print(F("DHT22 gercek disi nem okudu (H="));
    Serial.print(h, 1);
    Serial.println(F(" %), gonderilmedi. Sensoru / yerini kontrol edin."));
    return;
  }

  Signal data;
  memset(&data, 0, sizeof(data));
  strcpy(data.sifre, SIFRE);
  strcpy(data.konum, KONUM);
  data.btn1 = false;
  memcpy(data.btn2, &t, sizeof(t));
  data.hmdty[0] = (int)(h * 10.0f + 0.5f);

  ResponseStatus rs = FixajSS.sendFixedMessage(highByte(GonderilecekAdres), lowByte(GonderilecekAdres),
                                               Kanal, &data, sizeof(Signal));
  Serial.print(F("T="));
  Serial.print(t, 1);
  Serial.print(F(" C  H="));
  Serial.print(h, 1);
  Serial.print(F(" %  -> "));
  Serial.println(rs.getResponseDescription());
}
