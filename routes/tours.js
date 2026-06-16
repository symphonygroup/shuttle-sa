// NOTE: morning1 and morning2 have the same stops
// NOTE: afternoon1 and afternoon2 have different stops

const TOURS = {
  morning1: {
    id: 'morning1',
    name: 'Jutarnja Tura 1',
    departureTime: '07:40',
    direction: 'toOffice',
    stops: [
      'Dobrinja',
      'Stup petlja',
      'Stup',
      'Kralj Fahd (Brkić petrol)',
      'Nedžarići',
      'RTV',
      'Otoka (bazen)',
      'Otoka',
      'Čengić Vila',
      'Malta',
      'Socijalno',
      'Pofalići',
      'Muzej',
      'SCC',
      'Skenderija',
      'Šumarski fakultet (Zagrebačka)',
      'Vrace (Nešković pumpa)',
      'Office'
    ]
  },
  morning2: {
    id: 'morning2',
    name: 'Jutarnja Tura 2',
    departureTime: '08:40',
    direction: 'toOffice',
    stops: [
      'Dobrinja',
      'Stup petlja',
      'Stup',
      'Kralj Fahd (Brkić petrol)',
      'Nedžarići',
      'RTV',
      'Otoka (bazen)',
      'Otoka',
      'Čengić Vila',
      'Malta',
      'Socijalno',
      'Pofalići',
      'Muzej',
      'SCC',
      'Skenderija',
      'Šumarski fakultet (Zagrebačka)',
      'Vrace (Nešković pumpa)',
      'Office'
    ]
  },
  afternoon1: {
    id: 'afternoon1',
    name: 'Popodnevna Tura 1',
    departureTime: '16:20',
    direction: 'fromOffice',
    stops: [
      'Office',
      'Vrace (Nešković pumpa)',
      'Šumarski fakultet (Zagrebačka)',
      'Skenderija',
      'SCC',
      'Grbavica 1',
      'Pofalići',
      'Grbavica (stadion)',
      'Hrasno brdo (kružni tok)',
      'Hrasno (Azize Šaćirbegović)',
      'Otoka (pijaca)'
    ]
  },
  afternoon2: {
    id: 'afternoon2',
    name: 'Popodnevna Tura 2',
    departureTime: '17:30',
    direction: 'fromOffice',
    stops: [
      'Office',
      'Vrace (Nešković pumpa)',
      'Šumarski fakultet (Zagrebačka)',
      'Skenderija',
      'SCC',
      'Grbavica 1',
      'Pofalići',
      'Grbavica (stadion)',
      'Hrasno brdo (kružni tok)',
      'Otoka (Capital)',
      'Otoka (bazen)',
      'RTV',
      'Nedžarići',
      'Stup'
    ]
  }
};

const TOTAL_SEATS = 19;

module.exports = { TOURS, TOTAL_SEATS };
