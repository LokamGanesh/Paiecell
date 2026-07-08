import { Heart, Mail, Instagram, Linkedin, Youtube, Facebook, Twitter } from "lucide-react";

const socials = [
  {
    label: "Email",
    href: "mailto:paieactivities01@gmail.com",
    icon: Mail,
    display: "paieactivities01@gmail.com",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/paie_cell_srkr",
    icon: Instagram,
    display: "paie_cell_srkr",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/paie-cell",
    icon: Linkedin,
    display: "PAIE Cell",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@paiecell",
    icon: Youtube,
    display: "PAIE Cell",
  },
];

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/paie-logo.png" alt="PAIE Cell" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-display font-bold text-foreground">PAIE Cell</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empowering youth through holistic education, meditation, and leadership development.
          </p>
        </div>

        {/* Contact & Socials */}
        <div>
          <h4 className="font-display font-semibold mb-4 text-foreground">Connect with us</h4>
          <ul className="space-y-2.5">
            {socials.map(({ label, href, icon: Icon, display }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Icon className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
                  <span>{display}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-1 text-sm text-muted-foreground">
        @2026  paie cell copyrights
      </div>
    </div>
  </footer>
);

export default Footer;
