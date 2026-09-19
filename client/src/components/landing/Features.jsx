import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, Leaf, FileText, History, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const features = [
  {
    icon: Satellite,
    titleKey: 'features.item1.title',
    titleDefault: 'Field Intelligence',
    descKey: 'features.item1.desc',
    descDefault:
      'Use satellite and geospatial data to understand vegetation health, water conditions, and changes across local farming areas.',
    color: 'var(--brand-blue)'
  },
  {
    icon: Leaf,
    titleKey: 'features.item2.title',
    titleDefault: 'Crop Health Signals',
    descKey: 'features.item2.desc',
    descDefault:
      'Track NDVI, NDWI, land surface temperature, rainfall, and vegetation trends to identify changing crop and field conditions.',
    color: 'var(--score-excellent)'
  },
  {
    icon: AlertTriangle,
    titleKey: 'features.item3.title',
    titleDefault: 'Weather Risk Alerts',
    descKey: 'features.item3.desc',
    descDefault:
      'Identify upcoming heat, heavy rainfall, dry spells, and other weather conditions that could affect farm operations.',
    color: 'var(--semantic-warning)'
  },
  {
    icon: Leaf,
    titleKey: 'features.item4.title',
    titleDefault: 'AI Farm Recommendations',
    descKey: 'features.item4.desc',
    descDefault:
      'Turn weather, crop, and field information into practical recommendations for sowing, irrigation, spraying, and harvesting.',
    color: 'var(--brand-mint)'
  },
  {
    icon: History,
    titleKey: 'features.item5.title',
    titleDefault: 'Season & Historical Insights',
    descKey: 'features.item5.desc',
    descDefault:
      'Compare historical weather and vegetation patterns to understand seasonal changes and support better planning.',
    color: 'var(--brand-violet)'
  },
  {
    icon: FileText,
    titleKey: 'features.item6.title',
    titleDefault: 'Farmer-Ready Reports',
    descKey: 'features.item6.desc',
    descDefault:
      'Generate simple, actionable reports that combine local weather, field indicators, crop guidance, and identified risks.',
    color: 'var(--semantic-info)'
  }
];

export const Features = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-canvas-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            {t('features.headline', 'Intelligence at Scale')}
          </h2>
          <p className="text-body text-text-secondary text-lg">
            {t('features.subheadline', 'Everything you need to understand rural environments, powered by the most advanced satellite and AI stack.')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-surface-slate border border-surface-border rounded-2xl p-6 relative overflow-hidden group hover:border-brand-mint/50 hover:shadow-lg transition-all"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color}, transparent)` }}
              />
              
              <div 
                className="w-12 h-12 rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center mb-6"
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              
              <h3 className="text-heading-md text-text-primary mb-3">
                {t(feature.titleKey, feature.titleDefault)}
              </h3>
              
              <p className="text-body text-text-secondary">
                {t(feature.descKey, feature.descDefault)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
