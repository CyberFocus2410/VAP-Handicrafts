"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminNav } from "./AdminNav";
import {
  SiteContentConfig,
  SiteAnnouncementContent,
  SiteHeroContent,
  SiteBrandStoryContent,
  SiteScrapbookItem,
} from "@/server/admin/crm-cms-types";

interface AdminContentViewProps {
  initialConfig: SiteContentConfig;
}

export const AdminContentView: React.FC<AdminContentViewProps> = ({
  initialConfig,
}) => {
  const [config, setConfig] = useState<SiteContentConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"announcement" | "hero" | "brandStory" | "scrapbook">(
    "announcement"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Local state for active editing
  const [announcement, setAnnouncement] = useState<SiteAnnouncementContent>(
    initialConfig.announcement
  );
  const [hero, setHero] = useState<SiteHeroContent>(initialConfig.hero);
  const [brandStory, setBrandStory] = useState<SiteBrandStoryContent>(
    initialConfig.brandStory
  );
  const [scrapbook, setScrapbook] = useState<SiteScrapbookItem[]>(
    initialConfig.scrapbook
  );

  const handleSaveSection = async (sectionKey: "announcement" | "hero" | "brandStory" | "scrapbook") => {
    setIsSaving(true);
    setNotification("");

    let payload: Partial<SiteContentConfig> = {};
    if (sectionKey === "announcement") payload = { announcement };
    if (sectionKey === "hero") payload = { hero };
    if (sectionKey === "brandStory") payload = { brandStory };
    if (sectionKey === "scrapbook") payload = { scrapbook };

    try {
      const res = await fetch("/api/admin/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: payload }),
      });

      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setNotification(`${sectionKey.toUpperCase()} content updated successfully!`);
        setTimeout(() => setNotification(""), 3500);
      } else {
        alert(data.error || "Failed to save content");
      }
    } catch {
      alert("Network error updating site content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateScrapbookItem = (
    index: number,
    field: keyof SiteScrapbookItem,
    value: string
  ) => {
    const item = scrapbook[index];
    if (!item) return;
    const updated = [...scrapbook];
    updated[index] = { ...item, [field]: value };
    setScrapbook(updated);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="content" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
                Storefront &amp; Hero CMS
              </h1>
              <span className="text-xs bg-[#2D1A16]/10 text-[#2D1A16] px-2.5 py-1 rounded-full font-semibold">
                Live Customizer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/60 mt-1">
              Directly edit announcement banners, homepage headlines, founder narrative &amp; polaroid scrapbook visuals.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[#2D1A16]/20 bg-white hover:bg-[#FAF5EF] text-[#2D1A16] transition flex items-center gap-1.5"
          >
            <span>Preview Live Site</span>
            <span>↗</span>
          </a>
        </div>

        {notification && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {notification}
          </div>
        )}

        {/* Section Sub-tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#2D1A16]/10 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("announcement")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "announcement"
                ? "bg-[#2D1A16] text-[#FAF5EF] font-semibold shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            📢 Announcement Banner
          </button>
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "hero"
                ? "bg-[#2D1A16] text-[#FAF5EF] font-semibold shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            ✨ Homepage Hero
          </button>
          <button
            onClick={() => setActiveTab("brandStory")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "brandStory"
                ? "bg-[#2D1A16] text-[#FAF5EF] font-semibold shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            📖 Founder Story
          </button>
          <button
            onClick={() => setActiveTab("scrapbook")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "scrapbook"
                ? "bg-[#2D1A16] text-[#FAF5EF] font-semibold shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            📷 Polaroid Gallery
          </button>
        </div>

        {/* Tab 1: Announcement Banner */}
        {activeTab === "announcement" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D1A16]/10 shadow-sm max-w-3xl">
            <h2 className="font-serif text-xl font-bold text-[#2D1A16] mb-1">
              Top Announcement Ribbon
            </h2>
            <p className="text-xs text-[#2D1A16]/60 mb-6">
              Shown across the top of all customer pages. Great for shipping offers, festive discounts, or craft updates.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF5EF] border border-[#2D1A16]/10">
                <div>
                  <div className="text-xs font-semibold text-[#2D1A16]">
                    Banner Visibility
                  </div>
                  <div className="text-[11px] text-[#2D1A16]/60">
                    Show or hide the announcement bar across the store
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={announcement.isEnabled}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, isEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-[#2D1A16] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Banner Message Text
                </label>
                <input
                  type="text"
                  value={announcement.text}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, text: e.target.value })
                  }
                  placeholder="✨ Free delivery on orders above ₹999..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Call-to-Action Text
                  </label>
                  <input
                    type="text"
                    value={announcement.linkText}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, linkText: e.target.value })
                    }
                    placeholder="Shop New Arrivals"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    value={announcement.linkUrl}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, linkUrl: e.target.value })
                    }
                    placeholder="/products"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleSaveSection("announcement")}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs sm:text-sm font-semibold hover:bg-black transition shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Announcement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Homepage Hero */}
        {activeTab === "hero" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D1A16]/10 shadow-sm max-w-3xl">
            <h2 className="font-serif text-xl font-bold text-[#2D1A16] mb-1">
              Homepage Hero Section
            </h2>
            <p className="text-xs text-[#2D1A16]/60 mb-6">
              The primary visual statement patrons experience when visiting VAP Handicrafts.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Hero Eyebrow (Small Top Title)
                </label>
                <input
                  type="text"
                  value={hero.eyebrow}
                  onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                  placeholder="Artisanal Ocean Shell Jewellery & Custom Keepsakes"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Main Headline (Standard)
                  </label>
                  <input
                    type="text"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Handmade Treasures,"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Italic Accent Part (Serif Font)
                  </label>
                  <input
                    type="text"
                    value={hero.italicTitlePart}
                    onChange={(e) =>
                      setHero({ ...hero, italicTitlePart: e.target.value })
                    }
                    placeholder="Crafted with Love."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Hero Sub-Narrative Description
                </label>
                <textarea
                  rows={3}
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  placeholder="Discover authentic cowrie shell jewellery..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={hero.primaryCtaText}
                    onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={hero.primaryCtaLink}
                    onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={hero.secondaryCtaText}
                    onChange={(e) =>
                      setHero({ ...hero, secondaryCtaText: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={hero.secondaryCtaLink}
                    onChange={(e) =>
                      setHero({ ...hero, secondaryCtaLink: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleSaveSection("hero")}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs sm:text-sm font-semibold hover:bg-black transition shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Hero Content"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Brand Story */}
        {activeTab === "brandStory" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D1A16]/10 shadow-sm max-w-3xl">
            <h2 className="font-serif text-xl font-bold text-[#2D1A16] mb-1">
              Founder &amp; Heritage Narrative
            </h2>
            <p className="text-xs text-[#2D1A16]/60 mb-6">
              Highlights Pulkit Garg &amp; Vivan Mittal&apos;s craftsmanship, coastal shell sourcing, and Indian artisan values.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Story Eyebrow
                </label>
                <input
                  type="text"
                  value={brandStory.eyebrow}
                  onChange={(e) =>
                    setBrandStory({ ...brandStory, eyebrow: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={brandStory.heading}
                  onChange={(e) =>
                    setBrandStory({ ...brandStory, heading: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Highlight Quote / Punchline
                </label>
                <input
                  type="text"
                  value={brandStory.highlightPhrase}
                  onChange={(e) =>
                    setBrandStory({ ...brandStory, highlightPhrase: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Narrative Paragraph 1
                </label>
                <textarea
                  rows={4}
                  value={brandStory.narrativeParagraph1}
                  onChange={(e) =>
                    setBrandStory({
                      ...brandStory,
                      narrativeParagraph1: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                  Narrative Paragraph 2
                </label>
                <textarea
                  rows={4}
                  value={brandStory.narrativeParagraph2}
                  onChange={(e) =>
                    setBrandStory({
                      ...brandStory,
                      narrativeParagraph2: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={brandStory.badgeTitle}
                    onChange={(e) =>
                      setBrandStory({ ...brandStory, badgeTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Badge Subtitle
                  </label>
                  <input
                    type="text"
                    value={brandStory.badgeSubtitle}
                    onChange={(e) =>
                      setBrandStory({ ...brandStory, badgeSubtitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleSaveSection("brandStory")}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs sm:text-sm font-semibold hover:bg-black transition shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Story Content"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Polaroid Scrapbook Gallery */}
        {activeTab === "scrapbook" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D1A16]/10 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#2D1A16] mb-1">
              Polaroid Keepsake Scrapbook Gallery
            </h2>
            <p className="text-xs text-[#2D1A16]/60 mb-6">
              Featured scrapbook tiles showcasing genuine shell bracelets, custom relationship licence cards, and unboxing moments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {scrapbook.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#FAF5EF]/60 border border-[#2D1A16]/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-44 rounded-xl overflow-hidden relative mb-4 bg-stone-200 border border-[#2D1A16]/10">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                          Tile {index + 1} Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleUpdateScrapbookItem(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                          Subtitle / Caption
                        </label>
                        <input
                          type="text"
                          value={item.subtitle}
                          onChange={(e) =>
                            handleUpdateScrapbookItem(index, "subtitle", e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={item.imageUrl}
                          onChange={(e) =>
                            handleUpdateScrapbookItem(index, "imageUrl", e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => handleSaveSection("scrapbook")}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs sm:text-sm font-semibold hover:bg-black transition shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Polaroid Gallery"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
