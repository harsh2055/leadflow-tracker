import { ExternalLink } from "lucide-react";

export default function Footer() {
  const integrations = [
    {
      name: "Salesforce",
      description: "Sync leads with Salesforce CRM",
      icon: "🔵",
      url: "#",
    },
    {
      name: "HubSpot",
      description: "Connect with HubSpot CRM",
      icon: "🟠",
      url: "#",
    },
    {
      name: "Slack",
      description: "Get lead notifications in Slack",
      icon: "🟣",
      url: "#",
    },
    {
      name: "Zapier",
      description: "Automate workflows with Zapier",
      icon: "⚡",
      url: "#",
    },
  ];

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Integrations</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Connect LeadFlow with your favorite tools to streamline your workflow
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <a
                key={integration.name}
                href={integration.url}
                className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{integration.icon}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <h4 className="font-medium text-foreground text-sm">{integration.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {integration.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">LeadFlow</h4>
              <p className="text-sm text-muted-foreground">
                Modern sales lead tracker for efficient pipeline management
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>&copy; 2026 LeadFlow. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
