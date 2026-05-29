import { 
  HeroSection, 
  HowItWorks, 
  AllLevelsSection,
  ForCompanies,
  ForCoaches,
  CallToAction, 
  LandingFooter 
} from '../../components/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <HowItWorks />
      <AllLevelsSection />
      {/* <FeaturedTracks /> */}
      <ForCompanies />
      <ForCoaches />
      <CallToAction />
      <LandingFooter />
    </div>
  );
};
