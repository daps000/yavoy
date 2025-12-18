import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function FAQPage() {
  const { t } = useTranslation();
  
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-4">{t("faq.title")}</h1>
        <p className="text-muted-foreground">{t("faq.subtitle")}</p>
      </div>
      
      <Card className="p-6 border-none shadow-md bg-white">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg">{t("faq.questions.transport.question")}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              {t("faq.questions.transport.answer")}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg">{t("faq.questions.payment.question")}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              {t("faq.questions.payment.answer")}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-lg">{t("faq.questions.contact.question")}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              {t("faq.questions.contact.answer")}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg">{t("faq.questions.costs.question")}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              {t("faq.questions.costs.answer")}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left text-lg">{t("faq.questions.cancel.question")}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              {t("faq.questions.cancel.answer")}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
