const { CropRecommendationModel } = require('../models/CropRecommendation.js');

 function getCropCatalog() {
  return [
    {
      priority: 1,
      category: 'agriculture',
      title: 'Soybean (JS 335 / DS 228) - High Vigor Oilseed',
      cropName: 'Soybean (JS 335 / DS 228)',
      urgency: 'high',
      suitabilityScore: 94,
      sowingWindow: 'June 15 - July 10 (Monsoon Onset)',
      timeframe: 'Kharif Season (June - October)',
      expectedYield: '10 - 12 Quintals / Acre',
      soilMatch: 'Black Cotton / Clay Loam Soil (pH 6.5 - 7.5)',
      waterNeed: 'Medium (450-500 mm rain during lifecycle)',
      scheme: 'NFSM-Oilseeds & PMFBY Crop Insurance',
      description: 'Soybean is highly recommended for black cotton terrain given the monsoon forecast. High market liquidity and natural nitrogen fixation.',
      actionableSteps: [
        'Perform seed treatment with Rhizobium culture prior to sowing.',
        'Ensure line spacing of 45 cm for maximum canopy light absorption.',
        'Apply NPK 20:60:40 kg/ha at basal sowing time.',
        'Monitor for Stem Fly and Semilooper during first 35 days.'
      ],
      expectedImpact: 'Estimated net return of ₹35,000 - ₹45,000 per acre with 94% climate resilience.',
      schemeEligible: ['NFSM Oilseeds', 'Pradhan Mantri Fasal Bima Yojana (PMFBY)']
    },
    {
      priority: 2,
      category: 'water',
      title: 'Chickpea / Harbara (Digvijay) - Drought Resistant Pulse',
      cropName: 'Chickpea / Harbara (Digvijay)',
      urgency: 'high',
      suitabilityScore: 91,
      sowingWindow: 'October 15 - November 15',
      timeframe: 'Rabi Season (October - February)',
      expectedYield: '8 - 11 Quintals / Acre',
      soilMatch: 'Medium to Heavy Black Soil with Good Drainage',
      waterNeed: 'Low to Medium (250-350 mm rain/irrigation)',
      scheme: 'PMKSY Micro-Irrigation & Soil Health Card',
      description: 'Digvijay variety exhibits exceptional drought tolerance and fusarium wilt resistance. Ideal post-monsoon crop after Kharif harvest.',
      actionableSteps: [
        'Soil testing to ensure adequate available phosphorus.',
        'One protective micro-irrigation at flowering and pod filling stage.',
        'Install Pheromone traps (5/acre) for Helicoverpa pod borer detection.'
      ],
      expectedImpact: 'Reduces water consumption by 40% while enriching soil organic nitrogen for next season.',
      schemeEligible: ['Soil Health Card Scheme', 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)']
    },
    {
      priority: 3,
      category: 'climate',
      title: 'Sorghum / Jowar (M35-1) - Dryland Cereal & Fodder',
      cropName: 'Sorghum / Jowar (M35-1)',
      urgency: 'medium',
      suitabilityScore: 88,
      sowingWindow: 'September 15 - October 15',
      timeframe: 'Rabi / Dryland Season',
      expectedYield: '12 - 15 Quintals Grain + Fodder / Acre',
      soilMatch: 'Deep Black to Medium Shallow Soil',
      waterNeed: 'Low (300-400 mm), highly drought tolerant',
      scheme: 'Sub-Mission on Seeds & RKVY Raftar',
      description: 'Extremely resilient dryland cereal crop providing both food grain and nutritious fodder for cattle during dry summer cycles.',
      actionableSteps: [
        'Adopt ridge and furrow method for in-situ moisture conservation.',
        'Basal dose of 40:20:0 NPK kg/ha during field preparation.',
        'Thinning at 21 days to maintain optimum plant population.'
      ],
      expectedImpact: 'Secures dual grain harvest and livestock fodder supply during low-rainfall cycles.',
      schemeEligible: ['RKVY Raftar Scheme', 'Sub-Mission on Seeds & Planting Material']
    }
  ];
}

 async function generateVillageRecommendations(village, metrics, score) {
  const catalog = getCropCatalog();

  const recommendations = catalog.map((rec, idx) => {
    let scoreAdj = rec.suitabilityScore;
    if (metrics?.soil_moisture < 0.25 && rec.category === 'water') {
      scoreAdj += 4;
    }

    const item = {
      id: `rec_${village.id}_${idx + 1}`,
      villageId: village.id,
      priority: rec.priority,
      category: rec.category,
      title: rec.title,
      cropName: rec.cropName,
      urgency: rec.urgency,
      suitabilityScore: Math.min(99, Math.max(70, scoreAdj)),
      sowingWindow: rec.sowingWindow,
      timeframe: rec.timeframe,
      expectedYield: rec.expectedYield,
      soilMatch: `${village.soilType || 'Black Cotton Soil'} - ${rec.soilMatch}`,
      waterNeed: rec.waterNeed,
      scheme: rec.scheme,
      description: rec.description,
      actionableSteps: rec.actionableSteps,
      expectedImpact: rec.expectedImpact,
      schemeEligible: rec.schemeEligible
    };

    CropRecommendationModel.updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true }
    ).catch(() => {});

    return item;
  });

  return recommendations;
}


module.exports = {
  getCropCatalog,
  generateVillageRecommendations

}