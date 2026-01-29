import { MainLayout } from "@/components/layout/MainLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is MahiExchange?",
          a: "MahiExchange is a premier online gaming and betting platform offering a wide range of games, secure transactions, and competitive odds.",
        },
        {
          q: "Is it legal to play in India?",
          a: "Yes, our platform complies with all applicable Indian laws regarding skill-based gaming and online entertainment.",
        },
        {
          q: "How do I create an account?",
          a: "Simply click the 'Sign Up' button in the top right corner, enter your details, and verify your email to get started.",
        },
      ],
    },
    {
      category: "Payments & Withdrawals",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "We accept UPI, Credit/Debit Cards, Net Banking, and select cryptocurrencies for deposits.",
        },
        {
          q: "How long do withdrawals take?",
          a: "Most withdrawals are processed instantly. Bank transfers may take 24-48 hours depending on your bank.",
        },
        {
          q: "Is there a minimum withdrawal limit?",
          a: "Yes, the minimum withdrawal amount is 🎰500.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Is my personal data safe?",
          a: "Absolutely. We use bank-grade encryption and strictly adhere to data protection regulations to ensure your information is secure.",
        },
        {
          q: "Can I change my username?",
          a: "Usernames cannot be changed once set. However, you can update your display name in the profile settings.",
        },
        {
          q: "What if I forget my password?",
          a: "You can use the 'Forgot Password' link on the login page to reset your password via email.",
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions about our platform, games, and
            services.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`item-${idx}-${qIdx}`}
                    className="border-border"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary no-underline transition-colors">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQ;
