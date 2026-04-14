"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";
import HireSkillButton from "./HireSkillButton";
import SkillCard from "./SkillCard";
import { addresses, skillsRegistryAbi } from "../lib/contracts";

const skillIds = [1, 2, 3, 4, 5, 6] as const;
const icons = ["📈", "🛡️", "⛽", "🔍", "⚡", "🚨"] as const;

export default function MarketplaceGrid() {
  const { data } = useReadContracts({
    contracts: skillIds.flatMap((id) => [
      {
        address: addresses.skillsRegistry,
        abi: skillsRegistryAbi,
        functionName: "getSkill",
        args: [BigInt(id)],
      },
      {
        address: addresses.skillsRegistry,
        abi: skillsRegistryAbi,
        functionName: "getSkillDescription",
        args: [BigInt(id)],
      },
    ]),
    query: {
      enabled:
        Boolean(addresses.skillsRegistry) &&
        addresses.skillsRegistry.startsWith("0x") &&
        addresses.skillsRegistry.length === 42,
    },
  });

  const skills = useMemo(() => {
    const output = skillIds.map((id, index) => {
      const skillTuple = data?.[index * 2]?.result as [string, string, bigint, bigint] | undefined;
      const description = data?.[index * 2 + 1]?.result as string | undefined;
      return {
        id,
        icon: icons[index],
        name: skillTuple?.[1] || `Skill #${id}`,
        description: description || "Deploy contracts and seed skills to load live marketplace data.",
        priceUSDC: skillTuple?.[2] || 0n,
        hires: Number(skillTuple?.[3] || 0n),
      };
    });

    return output;
  }, [data]);

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => (
        <div key={skill.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <SkillCard
            icon={skill.icon}
            name={skill.name}
            description={skill.description}
            price={`${formatUnits(skill.priceUSDC || 0n, 6)} USDC`}
            hires={skill.hires}
          />
          <HireSkillButton skillId={skill.id} priceUSDC={skill.priceUSDC || 0n} />
        </div>
      ))}
    </section>
  );
}
