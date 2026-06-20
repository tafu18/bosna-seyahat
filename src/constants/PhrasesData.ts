export interface Phrase {
  id: string;
  tr: string;
  en: string;
  bs: string;
  category: 'Genel' | 'Yemek' | 'Ulaşım' | 'Alışveriş' | 'Acil Durum';
}

export const CATEGORIES = ['Tümü', 'Genel', 'Yemek', 'Ulaşım', 'Alışveriş', 'Acil Durum'] as const;

export const PHRASES: Phrase[] = [
  { id: '1', tr: 'Merhaba', en: 'Hello', bs: 'Zdravo / Dobar dan', category: 'Genel' },
  { id: '2', tr: 'Teşekkür ederim', en: 'Thank you', bs: 'Hvala', category: 'Genel' },
  { id: '3', tr: 'Lütfen', en: 'Please', bs: 'Molim', category: 'Genel' },
  { id: '4', tr: 'Rica ederim', en: 'You\'re welcome', bs: 'Nema na čemu', category: 'Genel' },
  { id: '5', tr: 'Evet / Hayır', en: 'Yes / No', bs: 'Da / Ne', category: 'Genel' },
  { id: '6', tr: 'Afedersiniz', en: 'Excuse me', bs: 'Izvinite', category: 'Genel' },
  { id: '7', tr: 'İngilizce konuşuyor musunuz?', en: 'Do you speak English?', bs: 'Govorite li engleski?', category: 'Genel' },
  { id: '8', tr: 'Türkçe konuşuyor musunuz?', en: 'Do you speak Turkish?', bs: 'Govorite li turski?', category: 'Genel' },
  { id: '9', tr: 'Anlamıyorum', en: 'I don\'t understand', bs: 'Ne razumijem', category: 'Genel' },
  { id: '10', tr: 'Giriş / Çıkış', en: 'Entrance / Exit', bs: 'Ulaz / Izlaz', category: 'Genel' },
  { id: '11', tr: 'Bana yardım edebilir misiniz?', en: 'Can you help me?', bs: 'Možete li mi pomoći?', category: 'Genel' },
  
  { id: '12', tr: 'Hesap, lütfen', en: 'Bill, please', bs: 'Račun, molim', category: 'Yemek' },
  { id: '13', tr: 'Su, lütfen', en: 'Water, please', bs: 'Vodu, molim', category: 'Yemek' },
  { id: '14', tr: 'Çok lezzetli', en: 'Very delicious', bs: 'Veoma ukusno', category: 'Yemek' },
  { id: '15', tr: 'Menü alabilir miyim?', en: 'Can I have the menu?', bs: 'Mogu li dobiti meni?', category: 'Yemek' },
  { id: '16', tr: 'Ekmek, lütfen', en: 'Bread, please', bs: 'Hljeb, molim', category: 'Yemek' },
  
  { id: '17', tr: 'Nerede?', en: 'Where is...?', bs: 'Gdje je...?', category: 'Ulaşım' },
  { id: '18', tr: 'Havalimanı', en: 'Airport', bs: 'Aerodrom', category: 'Ulaşım' },
  { id: '19', tr: 'Otobüs durağı', en: 'Bus stop', bs: 'Autobuska stanica', category: 'Ulaşım' },
  { id: '20', tr: 'Taksi', en: 'Taxi', bs: 'Taksi', category: 'Ulaşım' },
  { id: '21', tr: 'Bilet nerede satılıyor?', en: 'Where are tickets sold?', bs: 'Gdje se prodaju karte?', category: 'Ulaşım' },
  { id: '22', tr: 'Otel', en: 'Hotel', bs: 'Hotel', category: 'Ulaşım' },
  
  { id: '23', tr: 'Bu ne kadar?', en: 'How much is this?', bs: 'Koliko ovo košta?', category: 'Alışveriş' },
  { id: '24', tr: 'Kredi kartı kabul ediyor musunuz?', en: 'Do you accept credit cards?', bs: 'Primate li kreditne kartice?', category: 'Alışveriş' },
  { id: '25', tr: 'Çok pahalı', en: 'Too expensive', bs: 'Preskupo', category: 'Alışveriş' },
  { id: '26', tr: 'İndirim yapabilir misiniz?', en: 'Can you give a discount?', bs: 'Možete li dati popust?', category: 'Alışveriş' },
  
  { id: '27', tr: 'Yardım edin!', en: 'Help me!', bs: 'Upomoć!', category: 'Acil Durum' },
  { id: '28', tr: 'Hastane', en: 'Hospital', bs: 'Bolnica', category: 'Acil Durum' },
  { id: '29', tr: 'Eczane', en: 'Pharmacy', bs: 'Apoteka', category: 'Acil Durum' },
  { id: '30', tr: 'Polisi arayın!', en: 'Call the police!', bs: 'Pozovite policiju!', category: 'Acil Durum' },
  { id: '31', tr: 'Kayboldum', en: 'I am lost', bs: 'Izgubio sam se', category: 'Acil Durum' }
];
