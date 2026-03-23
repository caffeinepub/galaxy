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
      qc.invalidateQueries({ queryKey: ["topDonors"] });
    },
  });
}

export function useGetTopDonors() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topDonors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopDonors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllStars(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allStars"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStars();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useSubmitStar() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      message,
    }: { name: string; message: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitStar(name, message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStars"] });
    },
  });
}

export function useGetPlanetJournal(planetName: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["planetJournal", planetName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalEntriesForPlanet(planetName);
    },
    enabled: !!actor && !isFetching && enabled && !!planetName,
  });
}

export function useSubmitJournalEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planetName,
      entry,
    }: { planetName: string; entry: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitJournalEntry(planetName, entry);
    },
    onSuccess: (_, { planetName }) => {
      qc.invalidateQueries({ queryKey: ["planetJournal", planetName] });
    },
  });
}

export function useIsPremiumUser(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isPremium", principal],
    queryFn: async () => {
      if (!actor || !principal) return false;
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.isPremiumUser(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useUserPurchaseRequests(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userPurchaseRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPurchaseRequests();
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 30_000 : false,
  });
}
