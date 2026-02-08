const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <div className="mb-12">
        <h1 className="font-display text-4xl sm:text-6xl font-black text-foreground mb-4">
          Terms & <span className="text-primary">Conditions</span>
        </h1>
        <p className="text-muted-foreground text-lg uppercase tracking-widest font-bold">
          Last updated: January 2026
        </p>
      </div>

      <div className="space-y-6">
        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">01</span>
            Acceptance of Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using MahiExchange, you accept and agree to be
            bound by the terms and provisions of this agreement. If you do not
            agree to abide by these terms, please do not use this service.
          </p>
        </section>

        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">02</span>
            Eligibility
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            To use MahiExchange, you must:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Be at least 18 years of age",
              "Be a resident of a legal jurisdiction",
              "Have legal capacity to enter agreements",
              "Not be excluded from gaming",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/10 p-3 rounded-xl border border-border"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_theme(colors.primary.DEFAULT)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">03</span>
            Account Registration
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to provide accurate, current, and complete information
            during registration and to update such information to keep it
            accurate. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities under your account.
          </p>
        </section>

        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">04</span>
            Deposits and Withdrawals
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            All financial transactions are subject to the following conditions:
          </p>
          <div className="space-y-3">
            {[
              "Minimum deposit and withdrawal amounts may apply",
              "Verification may be required before processing",
              "Processing times may vary by payment method",
              "Verification for large transactions",
            ].map((item) => (
              <div
                key={item}
                className="p-4 bg-muted/5 rounded-xl border border-border text-sm text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">05</span>
            Fair Play
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            All games use certified random number generators. Any attempt to
            manipulate games, exploit bugs, or engage in fraudulent activity
            will result in immediate account termination and forfeiture of
            funds.
          </p>
        </section>

        <section className="card-premium p-8 group">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="text-primary font-black opacity-30">06</span>
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            MahiExchange shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of the platform.
          </p>
        </section>

        <section className="card-premium p-8 border-primary/30">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground mb-6">
            For questions about these Terms & Conditions, please contact our
            24/7 support team.
          </p>
          <a
            href="mailto:support@mahiexchange.com"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
          >
            SUPPORT@MAHIEXCHANGE.COM
          </a>
        </section>
      </div>
    </div>
  );
};

export default Terms;
