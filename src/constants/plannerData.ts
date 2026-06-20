export interface Location {
  province: string;
  city: string;
}

export interface Activity {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: Location;
  mobilityNote: string;
  completed?: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface PlannerMetadata {
  adultCount: number;
  infantCount: number;
  baseCurrency: string;
  accommodation: string;
}

export interface Trip {
  title: string;
  startDate: string;
  endDate: string;
  metadata: PlannerMetadata;
  itinerary: ItineraryDay[];
}

export interface Planner {
  trip: Trip;
}

export const PLANNERS: Planner[] = [
    {
  "trip": {
    "title": "Bosna Hersek Aile Seyahati",
    "startDate": "2026-07-05",
    "endDate": "2026-07-09",
    "metadata": {
      "adultCount": 2,
      "infantCount": 1,
      "baseCurrency": "EUR",
      "accommodation": "Deluxe Bellevue"
    },
    "itinerary": [
      {
        "day": 1,
        "date": "2026-07-05",
        "title": "Varış ve Başçarşı'nın Ruhu",
        "activities": [
          {
            "id": "d1_a1",
            "startTime": "15:00",
            "endTime": "16:30",
            "title": "Havalimanı Varış ve Otele Yerleşme",
            "description": "SJJ Havalimanı'ndan otele geçiş, bebeğin beslenme ve dinlenme molası.",
            "location": {
              "province": "Saraybosna",
              "city": "Stari Grad (Eski Şehir)"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d1_a2",
            "startTime": "17:00",
            "endTime": "18:00",
            "title": "İkindi Namazı ve Türbe Ziyaretleri",
            "description": "Gazi Hüsrev Bey Camii'nde ikindi namazı, Gazi Hüsrev Bey ve Murat Bey Tardić türbeleri ziyareti.",
            "location": {
              "province": "Saraybosna",
              "city": "Başçarşı"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d1_a3",
            "startTime": "18:00",
            "endTime": "19:00",
            "title": "Hünkar Camii ve İshakoğlu İsa Bey",
            "description": "Şehrin kurucusu İshakoğlu İsa Bey'in kabrinin bulunduğu sakin Hünkar Camii avlusunda yürüyüş.",
            "location": {
              "province": "Saraybosna",
              "city": "Bistrik"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d1_a4",
            "startTime": "19:00",
            "endTime": "19:45",
            "title": "Yedi Kardeşler Türbesi",
            "description": "Miljacka nehri kenarından yürüyüş ve geleneksel Yedi Kardeşler türbesi ziyareti.",
            "location": {
              "province": "Saraybosna",
              "city": "Bistrik"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d1_a5",
            "startTime": "19:45",
            "endTime": "22:00",
            "title": "Sebil, Akşam Namazı ve Akşam Yemeği",
            "description": "Sebil ziyareti, Başçarşı Camii'nde akşam namazı ve meşhur Boşnak köftesi (Ćevapi) molası.",
            "location": {
              "province": "Saraybosna",
              "city": "Başçarşı"
            },
            "mobilityNote": "Puset uygun"
          }
        ]
      },
      {
        "day": 2,
        "date": "2026-07-06",
        "title": "Şelaleler, Mostar ve Doğa",
        "activities": [
          {
            "id": "d2_a1",
            "startTime": "07:15",
            "endTime": "08:30",
            "title": "Kahvaltılık Alışverişi ve Araç Teslimi",
            "description": "Fırından Boşnak poğaçaları alınıp SJJ Havalimanı'ndan aracın teslim alınması.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža (Havalimanı)"
            },
            "mobilityNote": "Araç içi"
          },
          {
            "id": "d2_a2",
            "startTime": "09:30",
            "endTime": "10:15",
            "title": "Konjic Kahvaltı Molası",
            "description": "Tarihi Taş Köprü manzarası ve Neretva nehri kenarında alınan kahvaltılıklarla mola.",
            "location": {
              "province": "Hersek-Neretva",
              "city": "Konjic"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d2_a3",
            "startTime": "10:15",
            "endTime": "12:00",
            "title": "Kravice Şelalesi",
            "description": "Rotanın en güney noktası, şelale etrafında yürüyüş ve doğa manzarası.",
            "location": {
              "province": "Batı Hersek",
              "city": "Ljubuški"
            },
            "mobilityNote": "Kanguru zorunlu"
          },
          {
            "id": "d2_a4",
            "startTime": "13:00",
            "endTime": "15:30",
            "title": "Blagaj Tekkesi ve Tekne Turu",
            "description": "Tarihi mescitte öğle namazı, Buna Nehri mağarasında sarsıntısız tekne turu.",
            "location": {
              "province": "Hersek-Neretva",
              "city": "Blagaj (Mostar)"
            },
            "mobilityNote": "Kanguru tavsiye edilir"
          },
          {
            "id": "d2_a5",
            "startTime": "16:00",
            "endTime": "18:15",
            "title": "Mostar Köprüsü ve Eski Çarşı",
            "description": "Koski Mehmed Paşa Camii'nde ikindi namazı, Mostar köprüsü ve tarihi sokaklarda gezi.",
            "location": {
              "province": "Hersek-Neretva",
              "city": "Mostar Merkez"
            },
            "mobilityNote": "Kanguru zorunlu"
          },
          {
            "id": "d2_a6",
            "startTime": "19:15",
            "endTime": "20:45",
            "title": "Jablanica Akşam Yemeği ve Namaz",
            "description": "Meşhur helal kuzu çevirme (Maksumić/Kovačević) ve restoranda/camide akşam namazı.",
            "location": {
              "province": "Hersek-Neretva",
              "city": "Jablanica"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d2_a7",
            "startTime": "20:45",
            "endTime": "22:15",
            "title": "Havalimanı Araç Teslimi ve Otele Dönüş",
            "description": "Aracın SJJ'ye teslimi ve taksi ile otele (Deluxe Bellevue) transfer.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža / Stari Grad"
            },
            "mobilityNote": "Araç içi"
          }
        ]
      },
      {
        "day": 3,
        "date": "2026-07-07",
        "title": "Kültürlerin Kesişimi ve Kuşbakışı Saraybosna",
        "activities": [
          {
            "id": "d3_a1",
            "startTime": "09:30",
            "endTime": "11:00",
            "title": "Kovaçi Şehitliği",
            "description": "Aliya İzzetbegoviç'in kabri ve Kovaçi şehitliğinin ziyareti.",
            "location": {
              "province": "Saraybosna",
              "city": "Kovači"
            },
            "mobilityNote": "Kanguru tavsiye edilir (Yokuşlu)"
          },
          {
            "id": "d3_a2",
            "startTime": "11:00",
            "endTime": "12:30",
            "title": "Vijećnica ve İnat Evi",
            "description": "Eski Belediye/Kütüphane binası ve nehir kenarındaki İnat Kuća gezisi.",
            "location": {
              "province": "Saraybosna",
              "city": "Baščaršija (Nehir Kenarı)"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d3_a3",
            "startTime": "12:56",
            "endTime": "14:30",
            "title": "Öğle Namazı ve Ev Yemekleri",
            "description": "Merkezde öğle namazı, aşçınicada (Aščinica) geleneksel Boşnak ev yemekleri (Sogan Dolma, Klepe).",
            "location": {
              "province": "Saraybosna",
              "city": "Başçarşı"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d3_a4",
            "startTime": "14:30",
            "endTime": "16:30",
            "title": "Latin Köprüsü ve Ferhadiye",
            "description": "1. Dünya Savaşı'nın başladığı köprü, Meeting of Cultures noktası ve Ferhadiye caddesi yürüyüşü.",
            "location": {
              "province": "Saraybosna",
              "city": "Centar"
            },
            "mobilityNote": "Puset için mükemmel"
          },
          {
            "id": "d3_a5",
            "startTime": "16:30",
            "endTime": "17:30",
            "title": "İkindi Namazı ve Tatlı Molası",
            "description": "Ferhadiye Camii'nde namaz, Boşnak kahvesi ve Trileçe molası.",
            "location": {
              "province": "Saraybosna",
              "city": "Centar"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d3_a6",
            "startTime": "17:30",
            "endTime": "21:00",
            "title": "Trebeviç Teleferiği ve Akşam Kapanışı",
            "description": "Kapalı kabinle dağa çıkış, manzara keyfi, şehre dönüşte akşam namazı ve hafif atıştırmalık.",
            "location": {
              "province": "Saraybosna",
              "city": "Trebević Dağı"
            },
            "mobilityNote": "Puset uygun"
          }
        ]
      },
      {
        "day": 4,
        "date": "2026-07-08",
        "title": "Yakın Tarih ve Oksijen Deposu",
        "activities": [
          {
            "id": "d4_a1",
            "startTime": "09:30",
            "endTime": "11:30",
            "title": "Umut Tüneli (Tunel Spasa)",
            "description": "Otelden taksiyle geçiş, tünel müzesi ve bahçe gezisi.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža (Butmir)"
            },
            "mobilityNote": "Müzede puset uygun, tünel içinde kanguru zorunlu"
          },
          {
            "id": "d4_a2",
            "startTime": "12:00",
            "endTime": "14:00",
            "title": "Öğle Namazı ve Yemek",
            "description": "Ilıca merkeze taksiyle geçiş, öğle namazı ve yemek molası.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža Merkez"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d4_a3",
            "startTime": "14:00",
            "endTime": "14:30",
            "title": "Velika Aleja ve Fayton",
            "description": "Asırlık ağaçlar arasında yürüyüş veya milli parka nostaljik fayton yolculuğu.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža (Velika Aleja)"
            },
            "mobilityNote": "Puset faytona katlanıp konabilir"
          },
          {
            "id": "d4_a4",
            "startTime": "14:30",
            "endTime": "17:30",
            "title": "Vrelo Bosna Milli Parkı",
            "description": "Bosna nehrinin kaynağında düz ayak parkur, kuğular ve şelaleler. Çimenlerde ikindi namazı.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža (Vrelo Bosna)"
            },
            "mobilityNote": "Puset için mükemmel"
          },
          {
            "id": "d4_a5",
            "startTime": "17:30",
            "endTime": "21:00",
            "title": "Tramvay Dönüşü ve Veda Yemeği",
            "description": "Ilıca'dan Başçarşı'ya tramvayla dönüş, akşam namazı ve son akşam yemeği.",
            "location": {
              "province": "Saraybosna",
              "city": "Başçarşı"
            },
            "mobilityNote": "Puset uygun"
          }
        ]
      },
      {
        "day": 5,
        "date": "2026-07-09",
        "title": "Alışveriş ve Dönüş",
        "activities": [
          {
            "id": "d5_a1",
            "startTime": "08:00",
            "endTime": "09:30",
            "title": "Börek Kahvaltısı",
            "description": "Şehir merkezinde meşhur Boşnak böreği kahvaltısı.",
            "location": {
              "province": "Saraybosna",
              "city": "Başçarşı"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d5_a2",
            "startTime": "09:30",
            "endTime": "11:30",
            "title": "Hediyelik Eşya ve Serbest Zaman",
            "description": "Ferhadiye ve Başçarşı etrafında son kahveler, hediyelik eşya (bakır/bıçak vb.) alışverişi.",
            "location": {
              "province": "Saraybosna",
              "city": "Centar / Stari Grad"
            },
            "mobilityNote": "Puset uygun"
          },
          {
            "id": "d5_a3",
            "startTime": "11:30",
            "endTime": "14:00",
            "title": "Havalimanı Transferi ve Uçuş",
            "description": "Otelden eşyaların alınması, taksiyle SJJ Havalimanı'na varış, havalimanında öğle namazı ve İstanbul'a kalkış.",
            "location": {
              "province": "Saraybosna",
              "city": "Ilidža (SJJ Havalimanı)"
            },
            "mobilityNote": "Puset uçağa kadar uygun"
          }
        ]
      }
    ]
  }
}
];
