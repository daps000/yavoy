import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { Input } from "@/components/ui/input";
import heroImage from "@assets/road-car_1764761779971.jpg";
import publishImage from "@assets/generated_images/green_car_with_map_route.png";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [searchDate, setSearchDate] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchOrigin) params.set("origen", searchOrigin);
    if (searchDest) params.set("destino", searchDest);
    if (searchDate !== "all") params.set("fecha", searchDate);
    
    const queryString = params.toString();
    setLocation(`/viajes${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full">
        {/* Hero Image with Text Inside */}
        <div className="relative h-[450px] md:h-[550px]">
          <img 
            src={heroImage} 
            alt={t("home.hero.imageAlt")} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.5)_30%,rgba(255,255,255,0.2)_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.4)_30%,transparent_60%)]"></div>
          
          {/* Title and Intro inside hero image */}
          <div className="absolute inset-0 flex items-start pt-[35px]">
            <div className="container px-4 md:px-6">
              <div className="max-w-2xl space-y-4">
                <h1 className="md:text-5xl lg:text-6xl font-bold font-serif text-foreground tracking-tight text-[30px] leading-[1.1]">
                  {t("home.hero.title")} <br/><span className="text-primary">{t("home.hero.titleHighlight")}</span>
                </h1>
                <p className="md:text-xl max-w-xl text-[14px] text-[#454545] ml-[3px] pr-[100px]">
                  {t("home.hero.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Card - overlapping below hero */}
        <div className="container px-4 md:px-6 -mt-[120px] relative z-10 pb-8">
          <div className="max-w-md mx-auto md:mx-0 md:ml-4">
            <form onSubmit={handleSearch}>
              <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-foreground">{t("home.search.title")}</h3>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <MapPin className="h-5 w-5 text-primary" />
                    <input
                      type="text"
                      placeholder={t("home.search.from")}
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                      data-testid="input-hero-origin"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <MapPin className="h-5 w-5 text-primary" />
                    <input
                      type="text"
                      placeholder={t("home.search.to")}
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                      data-testid="input-hero-dest"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Select value={searchDate} onValueChange={setSearchDate}>
                      <SelectTrigger className="flex-1 border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0">
                        <SelectValue placeholder={t("rides.filter.today")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[99]">
                        <SelectItem value="all">{t("rides.filter.anyDate")}</SelectItem>
                        <SelectItem value="today">{t("rides.filter.today")}</SelectItem>
                        <SelectItem value="tomorrow">{t("rides.filter.tomorrow")}</SelectItem>
                        <SelectItem value="upcoming">{t("rides.filter.upcoming")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-[#70b681] text-white rounded-none">
                    {t("common.search")}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-card pt-[32px] pb-[32px]">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-bold font-serif text-foreground mb-4 text-[26px]">{t("home.howItWorks.title")}</h2>
            <p className="text-muted-foreground text-[14px]">{t("home.howItWorks.subtitle")}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-[0px] pb-[0px]">
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                1
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">{t("home.howItWorks.step1.title")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("home.howItWorks.step1.description")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                2
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">{t("home.howItWorks.step2.title")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("home.howItWorks.step2.description")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                3
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">{t("home.howItWorks.step3.title")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("home.howItWorks.step3.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Publish Section */}
      <section className="py-16 bg-[#ffffff] pt-[32px] pb-[32px]">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-serif text-foreground mb-4">{t("home.publish.title")}</h2>
              <p className="text-muted-foreground text-[14px]">{t("home.publish.subtitle")}</p>
            </div>

            <Card className="border border-border shadow-lg bg-white overflow-hidden max-w-md mx-auto">
              <div className="w-full h-48 bg-gray-50">
                <img 
                  src={publishImage} 
                  alt={t("home.publish.title")} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-5 pb-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {t("home.publish.description")}
                  </p>
                  <Link href="/publicar">
                    <Button className="h-12 text-base bg-primary hover:bg-[#70b681] text-white rounded-full px-8">
                      {t("home.publish.button")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
