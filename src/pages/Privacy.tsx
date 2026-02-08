const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-8">
        Privacy <span className="text-primary">Policy</span>
      </h1>

      <div className="space-y-8 text-foreground/80">
        <p className="text-muted-foreground text-lg">
          Last updated: January 2026
        </p>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Information We Collect
          </h2>
          <p className="mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Payment information and transaction history</li>
            <li>Identity verification documents</li>
            <li>Gaming activity and preferences</li>
            <li>Communications with our support team</li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            How We Use Your Information
          </h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information, including encryption, secure servers, and
            regular security audits. However, no method of transmission over the
            Internet is 100% secure.
          </p>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Data Sharing
          </h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Payment processors and banking partners</li>
            <li>Game providers for gameplay purposes</li>
            <li>Regulatory authorities when required by law</li>
            <li>Service providers who assist our operations</li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Your Rights
          </h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>File a complaint with regulatory authorities</li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Cookies
          </h2>
          <p>
            We use cookies and similar technologies to enhance your experience,
            analyze usage, and assist in our marketing efforts. You can control
            cookie settings through your browser preferences.
          </p>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Contact Us
          </h2>
          <p>
            For privacy-related inquiries, please contact our Data Protection
            Officer at{" "}
            <a
              href="mailto:privacy@mahiexchange.com"
              className="text-primary hover:underline"
            >
              privacy@mahiexchange.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
