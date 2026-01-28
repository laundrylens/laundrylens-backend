import { PrismaClient, SymbolCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface SymbolData {
  category: SymbolCategory;
  code: string;
  iconUrl?: string;
  translations: {
    ko: { name: string; shortDesc: string; detailDesc: string };
    en: { name: string; shortDesc: string; detailDesc: string };
    jp: { name: string; shortDesc: string; detailDesc: string };
  };
}

const laundrySymbolsData: SymbolData[] = [
  // 세탁 기호 (WASH)
  {
    category: SymbolCategory.WASH,
    code: 'WASH_95',
    translations: {
      ko: {
        name: '95°C 물세탁',
        shortDesc: '95°C 이하 물 사용',
        detailDesc: '95°C 이하의 물에서 세탁할 수 있습니다. 삶을 수 있습니다.',
      },
      en: {
        name: 'Wash at 95°C',
        shortDesc: 'Use water up to 95°C',
        detailDesc: 'Can be washed in water up to 95°C. Can be boiled.',
      },
      jp: {
        name: '95°C洗濯',
        shortDesc: '95°C以下の水を使用',
        detailDesc: '95°C以下の水で洗濯できます。煮沸可能です。',
      },
    },
  },
  {
    category: SymbolCategory.WASH,
    code: 'WASH_60',
    translations: {
      ko: {
        name: '60°C 물세탁',
        shortDesc: '60°C 이하 물 사용',
        detailDesc:
          '60°C 이하의 물에서 세탁할 수 있습니다. 일반적인 면 제품에 적합합니다.',
      },
      en: {
        name: 'Wash at 60°C',
        shortDesc: 'Use water up to 60°C',
        detailDesc:
          'Can be washed in water up to 60°C. Suitable for cotton items.',
      },
      jp: {
        name: '60°C洗濯',
        shortDesc: '60°C以下の水を使用',
        detailDesc: '60°C以下の水で洗濯できます。一般的な綿製品に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.WASH,
    code: 'WASH_40',
    translations: {
      ko: {
        name: '40°C 물세탁',
        shortDesc: '40°C 이하 물 사용',
        detailDesc:
          '40°C 이하의 물에서 세탁할 수 있습니다. 대부분의 의류에 적합합니다.',
      },
      en: {
        name: 'Wash at 40°C',
        shortDesc: 'Use water up to 40°C',
        detailDesc:
          'Can be washed in water up to 40°C. Suitable for most garments.',
      },
      jp: {
        name: '40°C洗濯',
        shortDesc: '40°C以下の水を使用',
        detailDesc:
          '40°C以下の水で洗濯できます。ほとんどの衣類に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.WASH,
    code: 'WASH_30',
    translations: {
      ko: {
        name: '30°C 물세탁',
        shortDesc: '30°C 이하 물 사용',
        detailDesc:
          '30°C 이하의 물에서 부드럽게 세탁하세요. 섬세한 소재에 적합합니다.',
      },
      en: {
        name: 'Wash at 30°C',
        shortDesc: 'Use water up to 30°C',
        detailDesc:
          'Wash gently in water up to 30°C. Suitable for delicate fabrics.',
      },
      jp: {
        name: '30°C洗濯',
        shortDesc: '30°C以下の水を使用',
        detailDesc:
          '30°C以下の水でやさしく洗濯してください。デリケートな素材に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.WASH,
    code: 'WASH_HAND',
    translations: {
      ko: {
        name: '손세탁',
        shortDesc: '손으로만 세탁',
        detailDesc:
          '손으로만 세탁하세요. 세탁기 사용을 피하고 부드럽게 눌러 세탁합니다.',
      },
      en: {
        name: 'Hand wash only',
        shortDesc: 'Wash by hand',
        detailDesc:
          'Hand wash only. Avoid washing machines and gently press wash.',
      },
      jp: {
        name: '手洗い',
        shortDesc: '手で洗濯',
        detailDesc:
          '手洗いのみ可能です。洗濯機の使用を避け、やさしく押し洗いしてください。',
      },
    },
  },
  {
    category: SymbolCategory.WASH,
    code: 'WASH_NO',
    translations: {
      ko: {
        name: '물세탁 불가',
        shortDesc: '물세탁 금지',
        detailDesc:
          '물세탁을 하지 마세요. 드라이클리닝을 이용하거나 전문가에게 맡기세요.',
      },
      en: {
        name: 'Do not wash',
        shortDesc: 'No water washing',
        detailDesc:
          'Do not wash with water. Use dry cleaning or consult a professional.',
      },
      jp: {
        name: '洗濯不可',
        shortDesc: '水洗い禁止',
        detailDesc:
          '水洗いしないでください。ドライクリーニングまたは専門家にご相談ください。',
      },
    },
  },

  // 표백 기호 (BLEACH)
  {
    category: SymbolCategory.BLEACH,
    code: 'BLEACH_ANY',
    translations: {
      ko: {
        name: '모든 표백제 사용 가능',
        shortDesc: '표백 가능',
        detailDesc:
          '염소계 또는 산소계 표백제를 사용할 수 있습니다. 얼룩 제거에 효과적입니다.',
      },
      en: {
        name: 'Any bleach allowed',
        shortDesc: 'Bleaching allowed',
        detailDesc:
          'Chlorine or oxygen bleach can be used. Effective for stain removal.',
      },
      jp: {
        name: '漂白剤使用可',
        shortDesc: '漂白可能',
        detailDesc:
          '塩素系または酸素系漂白剤が使用できます。シミ抜きに効果的です。',
      },
    },
  },
  {
    category: SymbolCategory.BLEACH,
    code: 'BLEACH_OXYGEN',
    translations: {
      ko: {
        name: '산소계 표백제만',
        shortDesc: '비염소계 표백제만 사용',
        detailDesc:
          '산소계(비염소계) 표백제만 사용하세요. 염소계 표백제는 변색을 유발할 수 있습니다.',
      },
      en: {
        name: 'Non-chlorine bleach only',
        shortDesc: 'Oxygen bleach only',
        detailDesc:
          'Use only non-chlorine (oxygen) bleach. Chlorine bleach may cause discoloration.',
      },
      jp: {
        name: '酸素系漂白剤のみ',
        shortDesc: '非塩素系漂白剤のみ使用',
        detailDesc:
          '酸素系（非塩素系）漂白剤のみ使用してください。塩素系漂白剤は変色の原因になります。',
      },
    },
  },
  {
    category: SymbolCategory.BLEACH,
    code: 'BLEACH_NO',
    translations: {
      ko: {
        name: '표백 불가',
        shortDesc: '표백제 사용 금지',
        detailDesc:
          '어떤 표백제도 사용하지 마세요. 색상 변화나 손상이 발생할 수 있습니다.',
      },
      en: {
        name: 'Do not bleach',
        shortDesc: 'No bleach',
        detailDesc:
          'Do not use any bleach. May cause color change or damage.',
      },
      jp: {
        name: '漂白不可',
        shortDesc: '漂白剤使用禁止',
        detailDesc:
          '漂白剤は使用しないでください。色の変化や損傷の原因になります。',
      },
    },
  },

  // 건조 기호 (DRY)
  {
    category: SymbolCategory.DRY,
    code: 'DRY_TUMBLE_HIGH',
    translations: {
      ko: {
        name: '고온 건조기 사용 가능',
        shortDesc: '높은 온도로 건조',
        detailDesc:
          '높은 온도에서 텀블 건조할 수 있습니다. 면이나 린넨 제품에 적합합니다.',
      },
      en: {
        name: 'Tumble dry high',
        shortDesc: 'High heat drying',
        detailDesc:
          'Can tumble dry at high temperature. Suitable for cotton or linen.',
      },
      jp: {
        name: '高温タンブル乾燥可',
        shortDesc: '高温で乾燥',
        detailDesc: '高温でタンブル乾燥できます。綿やリネン製品に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.DRY,
    code: 'DRY_TUMBLE_LOW',
    translations: {
      ko: {
        name: '저온 건조기 사용 가능',
        shortDesc: '낮은 온도로 건조',
        detailDesc:
          '낮은 온도에서 텀블 건조하세요. 수축 방지를 위해 권장됩니다.',
      },
      en: {
        name: 'Tumble dry low',
        shortDesc: 'Low heat drying',
        detailDesc: 'Tumble dry at low temperature. Recommended to prevent shrinkage.',
      },
      jp: {
        name: '低温タンブル乾燥可',
        shortDesc: '低温で乾燥',
        detailDesc:
          '低温でタンブル乾燥してください。縮み防止のため推奨されます。',
      },
    },
  },
  {
    category: SymbolCategory.DRY,
    code: 'DRY_TUMBLE_NO',
    translations: {
      ko: {
        name: '건조기 사용 불가',
        shortDesc: '텀블 건조 금지',
        detailDesc: '건조기를 사용하지 마세요. 자연 건조만 가능합니다.',
      },
      en: {
        name: 'Do not tumble dry',
        shortDesc: 'No tumble drying',
        detailDesc: 'Do not use a dryer. Air dry only.',
      },
      jp: {
        name: 'タンブル乾燥不可',
        shortDesc: '乾燥機使用禁止',
        detailDesc: '乾燥機を使用しないでください。自然乾燥のみ可能です。',
      },
    },
  },
  {
    category: SymbolCategory.DRY,
    code: 'DRY_LINE',
    translations: {
      ko: {
        name: '줄 건조',
        shortDesc: '걸어서 건조',
        detailDesc:
          '빨랫줄에 걸어서 건조하세요. 통풍이 잘 되는 그늘에서 말립니다.',
      },
      en: {
        name: 'Line dry',
        shortDesc: 'Hang to dry',
        detailDesc: 'Dry on a clothesline. Dry in a well-ventilated shade.',
      },
      jp: {
        name: '吊り干し',
        shortDesc: '掛けて乾燥',
        detailDesc:
          '物干しに掛けて乾燥してください。風通しの良い日陰で乾かします。',
      },
    },
  },
  {
    category: SymbolCategory.DRY,
    code: 'DRY_FLAT',
    translations: {
      ko: {
        name: '뉘어 건조',
        shortDesc: '평평하게 널어 건조',
        detailDesc:
          '평평한 곳에 놓아서 건조하세요. 니트류의 변형을 방지합니다.',
      },
      en: {
        name: 'Dry flat',
        shortDesc: 'Lay flat to dry',
        detailDesc: 'Lay flat to dry. Prevents distortion of knitwear.',
      },
      jp: {
        name: '平干し',
        shortDesc: '平らに置いて乾燥',
        detailDesc:
          '平らな場所に置いて乾燥してください。ニット類の型崩れを防ぎます。',
      },
    },
  },

  // 다림질 기호 (IRON)
  {
    category: SymbolCategory.IRON,
    code: 'IRON_HIGH',
    translations: {
      ko: {
        name: '고온 다림질',
        shortDesc: '200°C 이하',
        detailDesc:
          '200°C 이하로 다림질할 수 있습니다. 면이나 린넨에 적합합니다.',
      },
      en: {
        name: 'Iron high',
        shortDesc: 'Up to 200°C',
        detailDesc: 'Can iron up to 200°C. Suitable for cotton or linen.',
      },
      jp: {
        name: '高温アイロン可',
        shortDesc: '200°C以下',
        detailDesc: '200°C以下でアイロンできます。綿やリネンに適しています。',
      },
    },
  },
  {
    category: SymbolCategory.IRON,
    code: 'IRON_MEDIUM',
    translations: {
      ko: {
        name: '중온 다림질',
        shortDesc: '150°C 이하',
        detailDesc:
          '150°C 이하로 다림질하세요. 폴리에스터 혼방에 적합합니다.',
      },
      en: {
        name: 'Iron medium',
        shortDesc: 'Up to 150°C',
        detailDesc:
          'Iron up to 150°C. Suitable for polyester blends.',
      },
      jp: {
        name: '中温アイロン可',
        shortDesc: '150°C以下',
        detailDesc:
          '150°C以下でアイロンしてください。ポリエステル混紡に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.IRON,
    code: 'IRON_LOW',
    translations: {
      ko: {
        name: '저온 다림질',
        shortDesc: '110°C 이하',
        detailDesc:
          '110°C 이하로 다림질하세요. 실크나 합성 섬유에 적합합니다.',
      },
      en: {
        name: 'Iron low',
        shortDesc: 'Up to 110°C',
        detailDesc: 'Iron up to 110°C. Suitable for silk or synthetic fibers.',
      },
      jp: {
        name: '低温アイロン可',
        shortDesc: '110°C以下',
        detailDesc:
          '110°C以下でアイロンしてください。シルクや合成繊維に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.IRON,
    code: 'IRON_NO',
    translations: {
      ko: {
        name: '다림질 불가',
        shortDesc: '다림질 금지',
        detailDesc:
          '다림질하지 마세요. 열에 의해 손상될 수 있습니다.',
      },
      en: {
        name: 'Do not iron',
        shortDesc: 'No ironing',
        detailDesc: 'Do not iron. May be damaged by heat.',
      },
      jp: {
        name: 'アイロン不可',
        shortDesc: 'アイロン禁止',
        detailDesc:
          'アイロンしないでください。熱によって損傷する可能性があります。',
      },
    },
  },

  // 드라이클리닝 기호 (DRYCLEAN)
  {
    category: SymbolCategory.DRYCLEAN,
    code: 'DRYCLEAN_ANY',
    translations: {
      ko: {
        name: '드라이클리닝 가능',
        shortDesc: '모든 용제 사용 가능',
        detailDesc:
          '모든 일반 용제로 드라이클리닝할 수 있습니다. 전문점에 맡기세요.',
      },
      en: {
        name: 'Dry clean any solvent',
        shortDesc: 'Any solvent allowed',
        detailDesc: 'Can be dry cleaned with any solvent. Take to a professional.',
      },
      jp: {
        name: 'ドライクリーニング可',
        shortDesc: '全ての溶剤使用可',
        detailDesc:
          '全ての一般溶剤でドライクリーニングできます。専門店にお任せください。',
      },
    },
  },
  {
    category: SymbolCategory.DRYCLEAN,
    code: 'DRYCLEAN_P',
    translations: {
      ko: {
        name: '석유계 드라이클리닝',
        shortDesc: '퍼클로로에틸렌 사용',
        detailDesc:
          '석유계 용제(퍼클로로에틸렌)로만 드라이클리닝하세요.',
      },
      en: {
        name: 'Dry clean - petroleum solvent',
        shortDesc: 'Perchloroethylene',
        detailDesc: 'Dry clean with petroleum solvent (perchloroethylene) only.',
      },
      jp: {
        name: '石油系ドライクリーニング',
        shortDesc: 'パークロロエチレン使用',
        detailDesc:
          '石油系溶剤（パークロロエチレン）のみでドライクリーニングしてください。',
      },
    },
  },
  {
    category: SymbolCategory.DRYCLEAN,
    code: 'DRYCLEAN_F',
    translations: {
      ko: {
        name: '불소계 드라이클리닝',
        shortDesc: '불소계 용제만 사용',
        detailDesc: '불소계 용제로만 드라이클리닝하세요. 섬세한 소재에 적합합니다.',
      },
      en: {
        name: 'Dry clean - fluorocarbon',
        shortDesc: 'Fluorocarbon solvent only',
        detailDesc:
          'Dry clean with fluorocarbon solvent only. Suitable for delicate fabrics.',
      },
      jp: {
        name: 'フッ素系ドライクリーニング',
        shortDesc: 'フッ素系溶剤のみ使用',
        detailDesc:
          'フッ素系溶剤のみでドライクリーニングしてください。デリケートな素材に適しています。',
      },
    },
  },
  {
    category: SymbolCategory.DRYCLEAN,
    code: 'DRYCLEAN_NO',
    translations: {
      ko: {
        name: '드라이클리닝 불가',
        shortDesc: '드라이클리닝 금지',
        detailDesc:
          '드라이클리닝하지 마세요. 물세탁만 가능하거나 특별한 관리가 필요합니다.',
      },
      en: {
        name: 'Do not dry clean',
        shortDesc: 'No dry cleaning',
        detailDesc:
          'Do not dry clean. Only water wash or requires special care.',
      },
      jp: {
        name: 'ドライクリーニング不可',
        shortDesc: 'ドライクリーニング禁止',
        detailDesc:
          'ドライクリーニングしないでください。水洗いのみ可能、または特別なケアが必要です。',
      },
    },
  },
];

async function main() {
  console.log('Seeding laundry symbols...');

  for (const symbolData of laundrySymbolsData) {
    const symbol = await prisma.laundrySymbol.upsert({
      where: { code: symbolData.code },
      update: {
        category: symbolData.category,
        iconUrl: symbolData.iconUrl || null,
      },
      create: {
        category: symbolData.category,
        code: symbolData.code,
        iconUrl: symbolData.iconUrl || null,
      },
    });

    // 번역 데이터 추가
    for (const [lang, translation] of Object.entries(symbolData.translations)) {
      await prisma.symbolTranslation.upsert({
        where: {
          symbolId_countryCode: {
            symbolId: symbol.id,
            countryCode: lang,
          },
        },
        update: {
          name: translation.name,
          shortDesc: translation.shortDesc,
          detailDesc: translation.detailDesc,
        },
        create: {
          symbolId: symbol.id,
          countryCode: lang,
          name: translation.name,
          shortDesc: translation.shortDesc,
          detailDesc: translation.detailDesc,
        },
      });
    }

    console.log(`  ✓ ${symbolData.code}`);
  }

  console.log(`\nSeeded ${laundrySymbolsData.length} laundry symbols.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
