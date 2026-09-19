import React from 'react';
import { LandingNavbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Stats } from '../components/landing/Stats';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Technology } from '../components/landing/Technology';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
  return (
    <>
      <LandingNavbar />
      <Hero />
      <Stats />
      <Features />
      <Technology />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
};
