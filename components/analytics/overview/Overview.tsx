"use client";

import AnalyticsStats from "../AnalyticsStats";
import ProductivityChart from "../ProductivityChart";
import ProductivityHeatmap from "../ProductivityHeatmap";
import SessionTypePerformance from "../SessionTypePerformance";
import FocusDistribution from "../FocusDistribution";
import BurnoutCard from "../BurnoutCard";
import CorrelationCard from "../CorrelationCard";
import AISummary from "../AISummary";
import Timeline from "../Timeline";

export default function Overview() {
  return (
    <div className="space-y-6">

      <AnalyticsStats />

      <div className="grid lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7">
          <ProductivityChart />
        </div>

        <div className="lg:col-span-5">
          <ProductivityHeatmap />
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-6">

        <div className="lg:col-span-4">
          <SessionTypePerformance />
        </div>

        <div className="lg:col-span-4">
          <FocusDistribution />
        </div>

        <div className="lg:col-span-4">
          <BurnoutCard />
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7">
          <CorrelationCard />
        </div>

        <div className="lg:col-span-5">
          <AISummary />
        </div>

      </div>

      <Timeline />

    </div>
  );
}