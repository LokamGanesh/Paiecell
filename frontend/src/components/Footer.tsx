import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/paie-logo.png" alt="PAIE Cell" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-display font-bold text-foreground">PAIE Cell</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empowering youth through holistic education, meditation, and leadership development.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
          <p className="text-sm text-muted-foreground">paie.cell@university.edu</p>
          <p className="text-sm text-muted-foreground">Follow us on social media</p>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-1 text-sm text-muted-foreground">
        Made with <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> by PAIE Cell
      </div>
    </div>
  </footer>
);

export default Footer;
