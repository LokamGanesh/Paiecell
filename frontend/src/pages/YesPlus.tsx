import { ArrowRight, ExternalLink, Loader } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

const YesPlus = () => {
  const { yesPlusSettings, loading } = useSettings();

  const registrationLink = yesPlusSettings?.link || 'https://asplace.artofliving.org/register';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Art of Living Program
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            YES+ Program
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            The <strong>Youth Empowerment & Skills</strong> workshop is a transformative program designed specifically for college students. Through powerful breathing techniques, meditation, and interactive processes, discover:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-3 mb-8 text-muted-foreground">
            {[
              "Scientifically validated stress-relief techniques",
              "Improved focus and academic performance",
              "Enhanced interpersonal skills and leadership",
              "A supportive community of like-minded peers",
              "Tools for emotional resilience and well-being",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-hero-gradient p-8 md:p-12 mb-8">
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-3">Ready to Transform?</h2>
            <p className="text-primary-foreground/80 mb-6">
              Register through the official ASPLACE portal. Your registration is tracked by PAIE Cell for campus coordination.
            </p>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-primary-foreground">Loading registration link...</span>
              </div>
            ) : (
              <a
                href={registrationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="gap-2 text-base">
                  Register on ASPLACE <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
            <p className="text-xs text-primary-foreground/60 mt-4">
              * Registration opens in a new window. UTM tracking helps us coordinate campus activities.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 text-left">
            <h3 className="font-display text-lg font-semibold text-card-foreground mb-3">About ASPLACE</h3>
            <p className="text-muted-foreground text-sm mb-4">
              ASPLACE (Art of Living Student Portal for Learning and Campus Engagement) is the official registration platform for Art of Living programs on campus. When you register through our link, PAIE Cell can:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Track campus participation and engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Coordinate logistics and venue arrangements</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Send you reminders and updates about the program</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Provide post-program support and follow-up activities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default YesPlus;
