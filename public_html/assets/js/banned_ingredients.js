// Yasaklı Aktif Maddeler Veritabanı ve Kontrol Modülü
const BANNED_ACTIVE_INGREDIENTS = [
    {
        "no": 1,
        "ad": "1,3-DICHLOROPROPENE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 2,
        "ad": "4-CPA (4-CHLOROPHENOXY ACETIC ACIDE)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 3,
        "ad": "ACEPHATE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 4,
        "ad": "ACETOCHLOR",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 5,
        "ad": "ALACHLOR",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 6,
        "ad": "ALDICARB",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 7,
        "ad": "AMINO ACIDE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 8,
        "ad": "AMINO ACIDS: MİX",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 9,
        "ad": "AMINOTRIAZOLE",
        "ithalat": "30/06/2020",
        "imalat": "31/07/2020",
        "kullanim": "31/12/2020"
    },
    {
        "no": 10,
        "ad": "AMITRAZ",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 11,
        "ad": "AMMONIUM THIOCYANATE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 12,
        "ad": "ANILOFOS",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 13,
        "ad": "ATCA",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 14,
        "ad": "ATRAZINE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 15,
        "ad": "AZINPHOS-METHYL",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 16,
        "ad": "AZOCYCLOTIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 17,
        "ad": "BENFURACARB",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 18,
        "ad": "BENOMYL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 19,
        "ad": "BETA CYPERMETHRIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 20,
        "ad": "BIFENTHRIN",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 21,
        "ad": "BITERTANOL",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 22,
        "ad": "BNOA (BETA NAPHTHOXY ACETIC ACIDE)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 23,
        "ad": "BRODIFACOUM",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 24,
        "ad": "BROMACIL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 25,
        "ad": "BROMOPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 26,
        "ad": "BROMOPHOS-ETHYL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 27,
        "ad": "BROMOPROPYLATE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 28,
        "ad": "BRONOPOL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 29,
        "ad": "BUTRALIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 30,
        "ad": "CADUSAFOS (AKA EBUFOS)",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 31,
        "ad": "CARBARYL",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 32,
        "ad": "CARBENDAZIM",
        "ithalat": "23/06/2017",
        "imalat": "23/06/2017",
        "kullanim": "01/01/2018"
    },
    {
        "no": 33,
        "ad": "CARBOFURAN",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 34,
        "ad": "CARBOSULFAN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 35,
        "ad": "CHINOMETHIONAT (AKA QUINOMETHIONATE)",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 36,
        "ad": "CHLORFENAPYR",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 37,
        "ad": "CHLORFENVINPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 38,
        "ad": "CHLORFLUAZURON",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 39,
        "ad": "CHLORIDAZON",
        "ithalat": "30/09/2020",
        "imalat": "01/01/2023",
        "kullanim": "30/09/2023"
    },
    {
        "no": 40,
        "ad": "CHLORONEB",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 41,
        "ad": "CHLOROPICRIN",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 42,
        "ad": "CHLOROTHALONIL",
        "ithalat": "31/12/2020",
        "imalat": "15/02/2021",
        "kullanim": "31/12/2021"
    },
    {
        "no": 43,
        "ad": "CHLORPROPHAM",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "31/12/2022"
    },
    {
        "no": 44,
        "ad": "CHLORPYRIFOS ETHYL",
        "ithalat": "08/04/2016",
        "imalat": "30/04/2016",
        "kullanim": "21/05/2020"
    },
    {
        "no": 45,
        "ad": "CHLORPYRIFOS METHYL",
        "ithalat": "31/10/2020",
        "imalat": "31.11.2020",
        "kullanim": "31/12/2021"
    },
    {
        "no": 46,
        "ad": "CIS-ZEATIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 47,
        "ad": "CLOTHIANIDIN",
        "ithalat": "07/01/2019",
        "imalat": "07/01/2019",
        "kullanim": "31/07/2019"
    },
    {
        "no": 48,
        "ad": "COUMACHLOR",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 49,
        "ad": "CYANAZINE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 50,
        "ad": "CYANIDES: CALCIUM, HYDROGEN, SODIUM",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 51,
        "ad": "CYCLOATE",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 52,
        "ad": "CYCLOSULFAMURON",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 53,
        "ad": "CYFLUTHRIN",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 54,
        "ad": "CYHEXATIN",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 55,
        "ad": "DESMEDIPHAM",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "01/08/2023"
    },
    {
        "no": 56,
        "ad": "DIAFENTHIURON",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 57,
        "ad": "DIAZINON",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 58,
        "ad": "DICHLOFLUANID",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 59,
        "ad": "DICHLORVOS (DDVP)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 60,
        "ad": "DICOFOL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 61,
        "ad": "DIFENACOUM",
        "ithalat": "30/06/2020",
        "imalat": "31/07/2020",
        "kullanim": "31/12/2020"
    },
    {
        "no": 62,
        "ad": "DIFENZOQUAT",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 63,
        "ad": "DIMETHENAMID",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 64,
        "ad": "DIMETHIPIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 65,
        "ad": "DIMETHOATE",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "01/08/2023"
    },
    {
        "no": 66,
        "ad": "DINICONAZOLE M",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 67,
        "ad": "DINOCAP",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 68,
        "ad": "DIOXACARB",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 69,
        "ad": "DIOXATHION",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 70,
        "ad": "DIPHENAMID",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 71,
        "ad": "DNOC",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 72,
        "ad": "ENDOSULFAN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 73,
        "ad": "ENDOTHAL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 74,
        "ad": "EPN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 75,
        "ad": "EPTC (ETHYL DIPROPYLTHIOCARBAMATE)",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 76,
        "ad": "ESBIOTHRIN (BIOALLETHRIN)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 77,
        "ad": "ETHALFLURALIN",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 78,
        "ad": "ETHIOFENCARB",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 79,
        "ad": "ETHION (AKA DIETHION)",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 80,
        "ad": "ETHIRIMOL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 81,
        "ad": "ETHOATE METHYL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 82,
        "ad": "ETHOPROPHOS",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "01/08/2023"
    },
    {
        "no": 83,
        "ad": "ETHOXYSULFURON",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "31/12/2021"
    },
    {
        "no": 84,
        "ad": "FENAMIDONE",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 85,
        "ad": "FENARIMOL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 86,
        "ad": "FENBUTATIN OKSIT",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 87,
        "ad": "FENITROTHION",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 88,
        "ad": "FENPICLONIL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 89,
        "ad": "FENPROPATHRIN",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 90,
        "ad": "FENPROPIMORPH",
        "ithalat": "30/06/2020",
        "imalat": "31/07/2020",
        "kullanim": "31/12/2020"
    },
    {
        "no": 91,
        "ad": "FENTHION",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 92,
        "ad": "FENTIN ACETATE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 93,
        "ad": "FENTIN HYDROXIDE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 94,
        "ad": "FENVALERATE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 95,
        "ad": "FIPRONIL",
        "ithalat": "30/06/2018",
        "imalat": "30/06/2018",
        "kullanim": "01/01/2019"
    },
    {
        "no": 96,
        "ad": "FLAMPROP-M",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 97,
        "ad": "FLOCOUMAFEN",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 98,
        "ad": "FLUAZIFOP",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 99,
        "ad": "FLUBENZIMINE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 100,
        "ad": "FLUCYTHRINATE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 101,
        "ad": "FLUFENOXURON",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 102,
        "ad": "FLUMETSULAM",
        "ithalat": "31/12/2009",
        "imalat": "31/12/2009",
        "kullanim": "31/12/2011"
    },
    {
        "no": 103,
        "ad": "FLURIDONE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 104,
        "ad": "FLUSILAZOLE",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "30/06/2022"
    },
    {
        "no": 105,
        "ad": "FLUTHIACET METHYL",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 106,
        "ad": "FOLIC ACID",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 107,
        "ad": "FOMESAFEN",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 108,
        "ad": "FORMOTHION",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 109,
        "ad": "FURATHIOCARB",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 110,
        "ad": "HALFENPROX (AKA BROFENPROX)",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 111,
        "ad": "HALOXYFOP",
        "ithalat": "31/12/2009",
        "imalat": "31/12/2009",
        "kullanim": "31/12/2011"
    },
    {
        "no": 112,
        "ad": "HALOXYFOP ETHOXYETHYLESTER",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 113,
        "ad": "HEXACONAZOLE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 114,
        "ad": "HEXAFLUMURON",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 115,
        "ad": "HIDROGEN PEROXIDE",
        "ithalat": "31/12/2016",
        "imalat": "31/12/2016",
        "kullanim": "31/12/2017"
    },
    {
        "no": 116,
        "ad": "HYDROGEN CYANAMIDE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 117,
        "ad": "HYDROXY MCPA",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 118,
        "ad": "IMAZAMETHABENZ METHYL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 119,
        "ad": "IMAZAPIC",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 120,
        "ad": "IMAZAPYR",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 121,
        "ad": "IMAZETHAPYR",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 122,
        "ad": "IMIDACLOPRID",
        "ithalat": "31/08/2023",
        "imalat": "15/11/2023",
        "kullanim": "31.12.2024\n31.12.2025"
    },
    {
        "no": 123,
        "ad": "IMINOCTADINE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 124,
        "ad": "INDOLYLACETIC ACID (AKA AUXINS)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 125,
        "ad": "IOXONIL",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "30/06/2022"
    },
    {
        "no": 126,
        "ad": "IPRODIONE",
        "ithalat": "19/02/2018",
        "imalat": "19/02/2018",
        "kullanim": "08/06/2018"
    },
    {
        "no": 127,
        "ad": "ISOFENPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 128,
        "ad": "KINETIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 129,
        "ad": "LINURON",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "01/08/2023"
    },
    {
        "no": 130,
        "ad": "MANCOZEB",
        "ithalat": "31/12/2021",
        "imalat": "15/04/2022",
        "kullanim": "31/12/2022"
    },
    {
        "no": 131,
        "ad": "MANEB",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 132,
        "ad": "MEPHOSPHOLAN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 133,
        "ad": "METHABENZTHIAZURON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 134,
        "ad": "METHIDATHION",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 135,
        "ad": "METHIOCARB",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "31/12/2021"
    },
    {
        "no": 136,
        "ad": "METHOMYL",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 137,
        "ad": "METHOPRENE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 138,
        "ad": "METOLACHLOR",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 139,
        "ad": "METOMINOSTROBIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 140,
        "ad": "METOSULAM",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 141,
        "ad": "MEVINPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 142,
        "ad": "MOLINATE",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 143,
        "ad": "MONOCROTOPHOS",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 144,
        "ad": "MONOLINURON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 145,
        "ad": "NORFLURAZON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 146,
        "ad": "NOVALURON",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "30/06/2022"
    },
    {
        "no": 147,
        "ad": "NUARIMOL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 148,
        "ad": "OFURACE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 149,
        "ad": "OMETHOATE",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 150,
        "ad": "ORTHOSULFAMURON",
        "ithalat": "30/06/2020",
        "imalat": "31/07/2020",
        "kullanim": "31/12/2020"
    },
    {
        "no": 151,
        "ad": "OXADIAZON",
        "ithalat": "30/09/2020",
        "imalat": "31/10/2020",
        "kullanim": "31/12/2022"
    },
    {
        "no": 152,
        "ad": "OXADIXYL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 153,
        "ad": "OXAMYL",
        "ithalat": "19/10/2011",
        "imalat": "19/10/2011",
        "kullanim": "01/06/2012"
    },
    {
        "no": 154,
        "ad": "OXINE COPPER",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 155,
        "ad": "OXYCARBOXIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 156,
        "ad": "OXYDEMETON METHYL",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 157,
        "ad": "PARAQUAT",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 158,
        "ad": "PARATHION METHYL",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 159,
        "ad": "PCNB (QUINTOZENE)",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 160,
        "ad": "PERMETHRIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 161,
        "ad": "PHENTHOATE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 162,
        "ad": "PHORATE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 163,
        "ad": "PHOSALONE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 164,
        "ad": "PHOSPHAMIDON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 165,
        "ad": "PHOSPHORIC ACID",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 166,
        "ad": "PINOLENE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 167,
        "ad": "PLANT EXTRACTS",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 168,
        "ad": "PRIMISULFURON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 169,
        "ad": "PRIMISULFURON METHYL",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 170,
        "ad": "PROCYMIDONE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 171,
        "ad": "PROFENOFOS",
        "ithalat": "31/12/2009",
        "imalat": "31/12/2009",
        "kullanim": "31/12/2011"
    },
    {
        "no": 172,
        "ad": "PROMETRYN",
        "ithalat": "01/01/2013",
        "imalat": "01/01/2013",
        "kullanim": "31/12/2014"
    },
    {
        "no": 173,
        "ad": "PROPANIL",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 174,
        "ad": "PROPARGITE",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 175,
        "ad": "PROPICONAZOLE",
        "ithalat": "31/12/2019",
        "imalat": "31/12/2019",
        "kullanim": "31/12/2020"
    },
    {
        "no": 176,
        "ad": "PROPINEB",
        "ithalat": "31/05/2018",
        "imalat": "31/05/2018",
        "kullanim": "01/01/2019"
    },
    {
        "no": 177,
        "ad": "PROPOXUR",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 178,
        "ad": "PROTHIOFOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 179,
        "ad": "PROTHOATE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 180,
        "ad": "PYMETROZINE",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "31/12/2021"
    },
    {
        "no": 181,
        "ad": "PYRAZOPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 182,
        "ad": "PYRIDAFENTHION",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 183,
        "ad": "PYRIMIDIFEN",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 184,
        "ad": "PYRITHIOBAC SODIUM",
        "ithalat": "04/04/2011",
        "imalat": "04/04/2011",
        "kullanim": "04/04/2013"
    },
    {
        "no": 185,
        "ad": "QUINALPHOS",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 186,
        "ad": "QUINOXYFEN",
        "ithalat": "31/12/2019",
        "imalat": "31/12/2019",
        "kullanim": "31/12/2020"
    },
    {
        "no": 187,
        "ad": "QUIZALOFOP",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 188,
        "ad": "RESMETHRIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 189,
        "ad": "SETHOXYDIM",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 190,
        "ad": "SIMAZINE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 191,
        "ad": "SODIUM DERIVATIVES",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 192,
        "ad": "STREPTOMYCES LYDICUS WYEL",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 193,
        "ad": "TCMTB",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 194,
        "ad": "TEBUTHIURON",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 195,
        "ad": "TEPRALOXYDIM",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "30/06/2022"
    },
    {
        "no": 196,
        "ad": "TERBUTRYNE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 197,
        "ad": "TETRADIFON",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 198,
        "ad": "THIACLOPRID",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "30.06.2022                                      (30.06.2021  Tohumda Kullanımının Sonlandırılma Tarihi)"
    },
    {
        "no": 199,
        "ad": "THIAZAFLURON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 200,
        "ad": "THIAZOPYR",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 201,
        "ad": "THIAMETHOXAM",
        "ithalat": "31/08/2023",
        "imalat": "15/11/2023",
        "kullanim": "31.12.2024\n31.12.2025"
    },
    {
        "no": 202,
        "ad": "THIDIAZURON",
        "ithalat": "31/12/2018",
        "imalat": "31/12/2018",
        "kullanim": "31/12/2019"
    },
    {
        "no": 203,
        "ad": "THIOBENCARB",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 204,
        "ad": "THIOCYCLAM HYDROGEN OXALATE",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 205,
        "ad": "THIODICARB",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 206,
        "ad": "THIOMETON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 207,
        "ad": "TOLFENPYRAD",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 208,
        "ad": "TOLYLFLUANID",
        "ithalat": "30/06/2011",
        "imalat": "30/06/2011",
        "kullanim": "31/08/2012"
    },
    {
        "no": 209,
        "ad": "TRALOMETHRIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 210,
        "ad": "TRALKOXYDIM",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "31/12/2021"
    },
    {
        "no": 211,
        "ad": "TRI ISOPROPANOLAMIN",
        "ithalat": "31/08/2009",
        "imalat": "31/08/2009",
        "kullanim": "31/08/2011"
    },
    {
        "no": 212,
        "ad": "TRIADIMEFON",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 213,
        "ad": "TRIADIMENOL",
        "ithalat": "31/08/2020",
        "imalat": "15/10/2020",
        "kullanim": "30/09/2021"
    },
    {
        "no": 214,
        "ad": "TRIASULFURON",
        "ithalat": "31/12/2020",
        "imalat": "31/01/2021",
        "kullanim": "31/12/2021"
    },
    {
        "no": 215,
        "ad": "TRIAZAMATE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 216,
        "ad": "TRIAZOPHOS",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 217,
        "ad": "TRICHLORFON",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 218,
        "ad": "TRIDEMORPH",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 219,
        "ad": "TRIFLOXYSULFURON SODIUM",
        "ithalat": "31/12/2016",
        "imalat": "31/12/2016",
        "kullanim": "31/12/2017"
    },
    {
        "no": 220,
        "ad": "TRIFLURALIN",
        "ithalat": "31/08/2012",
        "imalat": "31/08/2012",
        "kullanim": "30/06/2013"
    },
    {
        "no": 221,
        "ad": "TRIFORINE",
        "ithalat": "30/06/2010",
        "imalat": "30/06/2010",
        "kullanim": "31/08/2011"
    },
    {
        "no": 222,
        "ad": "TRIMEDLURE",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    },
    {
        "no": 223,
        "ad": "VINCLOZOLIN",
        "ithalat": "31/12/2008",
        "imalat": "31/12/2008",
        "kullanim": "31/12/2010"
    }
];

function checkBannedActiveIngredient(activeString) {
    if (!activeString) return null;
    
    // Normalize string by removing percentages, concentrations, units and replacing special chars with spaces
    const cleanString = (str) => {
        return str.toUpperCase()
            .replace(/%\s*\d+([.,]\d+)?/g, ' ')
            .replace(/\d+([.,]\d+)?\s*(G\/L|G\/KG|ML|G|MG|%|WG|WP|EC|SC|SP|OD|DF|SL|EW|CS)/g, ' ')
            .replace(/[\+\(\)\/\,\-\;\:\.\|]/g, ' ')
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length > 0);
    };

    const activeWords = cleanString(activeString);
    if (activeWords.length === 0) return null;

    for (const item of BANNED_ACTIVE_INGREDIENTS) {
        const bannedWords = cleanString(item.ad);
        if (bannedWords.length === 0) continue;

        // Check if the sequence of bannedWords exists in activeWords
        let matchFound = false;
        for (let i = 0; i <= activeWords.length - bannedWords.length; i++) {
            let subMatch = true;
            for (let j = 0; j < bannedWords.length; j++) {
                if (activeWords[i + j] !== bannedWords[j]) {
                    subMatch = false;
                    break;
                }
            }
            if (subMatch) {
                matchFound = true;
                break;
            }
        }

        if (matchFound) {
            return item.ad;
        }
    }
    return null;
}

function checkBannedProductInTank(name) {
    if (!name) return null;
    const cleanName = name.trim().toUpperCase();
    
    // 1. Try to find product in active database first
    const db = typeof bkuDatabase !== 'undefined' ? bkuDatabase : (typeof DEFAULT_BKU_DATABASE !== 'undefined' ? DEFAULT_BKU_DATABASE : []);
    if (db.length > 0) {
        const dbProduct = db.find(item => item && item.ad && item.ad.toUpperCase() === cleanName);
        if (dbProduct && dbProduct.aktif) {
            const bannedActive = checkBannedActiveIngredient(dbProduct.aktif);
            if (bannedActive) return bannedActive;
        }
    }
    
    // 2. Fallback: check if the name itself is or contains a banned ingredient
    const bannedActive = checkBannedActiveIngredient(name);
    if (bannedActive) return bannedActive;
    
    return null;
}

// Global DOM Auto-Scanning for Fruit Calendar Cards
document.addEventListener('DOMContentLoaded', () => {
    // Scan static cards
    const scanCards = () => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const activeEl = card.querySelector('.product-active');
            if (activeEl) {
                const activeText = activeEl.textContent.replace('Etken:', '').replace('Etken: ', '').trim();
                const bannedIngredient = checkBannedActiveIngredient(activeText);
                if (bannedIngredient) {
                    // Highlight card
                    card.style.borderColor = 'rgba(231, 76, 60, 0.4)';
                    card.style.background = 'rgba(231, 76, 60, 0.02)';
                    
                    // Add warning badge if not already added
                    if (!card.querySelector('.banned-warning-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'banned-warning-badge';
                        badge.style.color = '#e74c3c';
                        badge.style.backgroundColor = 'rgba(231, 76, 60, 0.12)';
                        badge.style.border = '1px solid rgba(231, 76, 60, 0.2)';
                        badge.style.borderRadius = '6px';
                        badge.style.padding = '8px';
                        badge.style.fontSize = '0.78rem';
                        badge.style.fontWeight = 'bold';
                        badge.style.marginTop = '10px';
                        badge.style.display = 'block';
                        badge.style.textAlign = 'center';
                        badge.innerHTML = '⚠️ YASAKLI AKTİF MADDE: <strong>' + bannedIngredient + '</strong>';
                        card.appendChild(badge);
                    }
                }
            }
        });
    };

    scanCards();
    
    // Repeat scan when filter buttons are clicked
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(scanCards, 350); // wait for fade animation
        });
    });

    // Global change/input listener for the modal editor
    document.addEventListener('input', (e) => {
        if (e.target && (e.target.id === 'edit-prod-active' || e.target.id === 'edit-prod-recommend')) {
            checkAndWarnBannedInEditor();
        }
    });
    
    document.addEventListener('change', (e) => {
        if (e.target && (e.target.id === 'edit-prod-active' || e.target.id === 'edit-prod-recommend')) {
            checkAndWarnBannedInEditor();
        }
    });

    // Check when card is clicked (modal opens)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            setTimeout(checkAndWarnBannedInEditor, 60);
        }
    });
});

function checkAndWarnBannedInEditor() {
    const activeInput = document.getElementById('edit-prod-active');
    if (!activeInput) return;
    
    const activeVal = activeInput.value;
    const banned = checkBannedActiveIngredient(activeVal);
    
    let warnEl = document.getElementById('banned-editor-warning');
    const form = document.getElementById('edit-product-form');
    
    if (banned) {
        if (!warnEl && form) {
            warnEl = document.createElement('div');
            warnEl.id = 'banned-editor-warning';
            warnEl.style.color = '#e74c3c';
            warnEl.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            warnEl.style.border = '1px solid rgba(231, 76, 60, 0.2)';
            warnEl.style.padding = '10px';
            warnEl.style.borderRadius = '8px';
            warnEl.style.marginTop = '12px';
            warnEl.style.fontSize = '0.85rem';
            warnEl.style.fontWeight = 'bold';
            
            const actions = form.querySelector('.modal-actions');
            if (actions) {
                form.insertBefore(warnEl, actions);
            } else {
                form.appendChild(warnEl);
            }
        }
        if (warnEl) {
            warnEl.innerHTML = '⚠️ DİKKAT: Girilen/seçilen aktif madde (' + banned + ') ithalatı/imalatı durdurulmuş YASAKLI bir maddedir! Bu ürünü kullanmamanız tavsiye edilir.';
            warnEl.style.display = 'block';
        }
    } else {
        if (warnEl) warnEl.style.display = 'none';
    }
}
