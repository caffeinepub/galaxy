import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Favorite planet saved!");
    },
    onError: () => toast.error("Failed to save profile"),
  });
}

export function useTotalDonations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalDonations"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getTotalDonations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      amountCents,
      message,
    }: {
      amountCents: number;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const successUrl = `${window.location.origin}${window.location.pathname}?payment_success=1&amount=${amountCents}`;
      const cancelUrl = `${window.location.origin}${window.location.pathname}?payment_cancelled=1`;
      const items = [
        {
          productName: "Space Exploration Donation",
          currency: "usd",
          quantity: 1n,
          priceInCents: BigInt(amountCents),
          productDescription: message || "Supporting space exploration",
        },
      ];
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
    onError: () => toast.error("Failed to create checkout session"),
  });
}

export function useRecordDonation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      message,
    }: { amount: bigint; message: string }) => {
      if (!actor) return;
      await actor.recordDonation(amount, message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totalDonations"] });
    },
  });
}
