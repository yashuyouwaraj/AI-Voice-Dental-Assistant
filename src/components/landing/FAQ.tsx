import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function FAQ() {
  return (
    <section id="faq" className="relative py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Quick answers about how DentWise works and what you can expect.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              Is DentWise a replacement for a real dentist?
            </AccordionTrigger>
            <AccordionContent>
              No. DentWise provides educational guidance and triage support. For
              diagnosis and treatment, you should always consult a licensed
              dentist.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              Can I book appointments directly in the app?
            </AccordionTrigger>
            <AccordionContent>
              Yes. You can select a dentist, choose date and time slots, and
              receive confirmation details by email.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              Who can use the AI voice assistant?
            </AccordionTrigger>
            <AccordionContent>
              Voice assistant access is plan-gated. Users with eligible plans
              (for example `ai_basic` or `ai_pro`) can use the voice experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How do reminder emails work?</AccordionTrigger>
            <AccordionContent>
              Reminder events are scheduled against appointments and dispatched
              automatically through cron/manual admin triggers when reminder
              features are enabled.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

export default FAQ;
