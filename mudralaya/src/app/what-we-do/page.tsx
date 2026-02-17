"use client";

import React from "react";
import WhatWeDoHero from "@/components/WhatWeDo/WhatWeDoHero";
import Challenges from "@/components/WhatWeDo/Challenges";
import SolutionModel from "@/components/WhatWeDo/SolutionModel";
import TaskTypes from "@/components/WhatWeDo/TaskTypes";
import Ecosystem from "@/components/WhatWeDo/Ecosystem";
import Security from "@/components/WhatWeDo/Security";
import BusinessModel from "@/components/WhatWeDo/BusinessModel";
import NextSteps from "@/components/WhatWeDo/NextSteps";

export default function WhatWeDoPage() {
    return (
        <main style={{ overflowX: 'hidden' }}>
            <WhatWeDoHero />
            <Challenges />
            <SolutionModel />
            <TaskTypes />
            <Ecosystem />
            <Security />
            <BusinessModel />
            <NextSteps />
        </main>
    );
}
