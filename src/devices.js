export const KINDLE_DEVICES = [
  {
    category: "Kindle Basic",
    models: [
      {
        id: "basic-11",
        name: "Kindle Basic 11th Gen (2022 / 2024)",
        width: 1072,
        height: 1448,
        ppi: 300,
        diagonal: "6.0\"",
        notes: "300 PPI high-res screen"
      },
      {
        id: "basic-10",
        name: "Kindle Basic 10th Gen (2019)",
        width: 600,
        height: 800,
        ppi: 167,
        diagonal: "6.0\"",
        notes: "167 PPI screen with front light"
      },
      {
        id: "basic-8",
        name: "Kindle Basic 8th Gen (2016)",
        width: 600,
        height: 800,
        ppi: 167,
        diagonal: "6.0\"",
        notes: "167 PPI screen"
      },
      {
        id: "basic-7",
        name: "Kindle Basic 7th Gen (2014) / 4 / 5",
        width: 600,
        height: 800,
        ppi: 167,
        diagonal: "6.0\"",
        notes: "Standard 600x800 resolution"
      }
    ]
  },
  {
    category: "Kindle Paperwhite",
    models: [
      {
        id: "pw-12",
        name: "Kindle Paperwhite 12th Gen (2024 / 7\")",
        width: 1264,
        height: 1680,
        ppi: 300,
        diagonal: "7.0\"",
        notes: "Latest 7\" Carta 1300 display"
      },
      {
        id: "pw-11",
        name: "Kindle Paperwhite 5 / 11th Gen (2021 / 6.8\")",
        width: 1236,
        height: 1648,
        ppi: 300,
        diagonal: "6.8\"",
        notes: "Popular 6.8\" Carta 1200 display"
      },
      {
        id: "pw-10",
        name: "Kindle Paperwhite 4 / 10th Gen (2018)",
        width: 1072,
        height: 1448,
        ppi: 300,
        diagonal: "6.0\"",
        notes: "Waterproof 6.0\" flush screen"
      },
      {
        id: "pw-7",
        name: "Kindle Paperwhite 3 / 7th Gen (2015)",
        width: 1072,
        height: 1448,
        ppi: 300,
        diagonal: "6.0\"",
        notes: "First 300 PPI Paperwhite"
      },
      {
        id: "pw-1-2",
        name: "Kindle Paperwhite 1 / 2 (2012 / 2013)",
        width: 758,
        height: 1024,
        ppi: 212,
        diagonal: "6.0\"",
        notes: "212 PPI screen"
      }
    ]
  },
  {
    category: "Kindle Oasis & Voyage",
    models: [
      {
        id: "oasis-2-3",
        name: "Kindle Oasis 2 & 3 (9th/10th Gen - 7.0\")",
        width: 1264,
        height: 1680,
        ppi: 300,
        diagonal: "7.0\"",
        notes: "Asymmetrical design with page turn buttons"
      },
      {
        id: "oasis-1",
        name: "Kindle Oasis 1st Gen (2016 - 6.0\")",
        width: 1072,
        height: 1448,
        ppi: 300,
        diagonal: "6.0\"",
        notes: "6.0\" ultra-compact Oasis"
      },
      {
        id: "voyage",
        name: "Kindle Voyage (2014 - 6.0\")",
        width: 1072,
        height: 1448,
        ppi: 300,
        diagonal: "6.0\"",
        notes: "Premium glass screen with PagePress"
      }
    ]
  },
  {
    category: "Kindle Scribe & Colorsoft",
    models: [
      {
        id: "scribe",
        name: "Kindle Scribe (10.2\" 2022 / 2024)",
        width: 1860,
        height: 2480,
        ppi: 300,
        diagonal: "10.2\"",
        notes: "Large 10.2\" notebook display"
      },
      {
        id: "colorsoft",
        name: "Kindle Colorsoft Signature Edition (2024)",
        width: 1264,
        height: 1680,
        ppi: 300,
        diagonal: "7.0\"",
        notes: "Color Kaleido / Colorsoft screen"
      }
    ]
  },
  {
    category: "Legacy & Large Format",
    models: [
      {
        id: "kindle-dx",
        name: "Kindle DX (9.7\")",
        width: 824,
        height: 1200,
        ppi: 150,
        diagonal: "9.7\"",
        notes: "Classic 9.7\" large reader"
      },
      {
        id: "kindle-keyboard",
        name: "Kindle 3 / Keyboard (2010)",
        width: 600,
        height: 800,
        ppi: 167,
        diagonal: "6.0\"",
        notes: "Physical keyboard edition"
      },
      {
        id: "custom",
        name: "Custom Resolution...",
        width: 1236,
        height: 1648,
        ppi: 300,
        diagonal: "Custom",
        notes: "Enter your custom width and height"
      }
    ]
  }
];

export function getDeviceById(id) {
  for (const group of KINDLE_DEVICES) {
    const found = group.models.find(m => m.id === id);
    if (found) return found;
  }
  return KINDLE_DEVICES[1].models[1]; // default to Paperwhite 11th Gen
}
