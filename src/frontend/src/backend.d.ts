import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PlanetJournal {
    planetName: string;
    entry: string;
    author: Principal;
    timestamp: Time;
}
export interface Star {
    owner: Principal;
    name: string;
    message: string;
    timestamp: Time;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Donation {
    message: string;
    timestamp: Time;
    amount: bigint;
    donor: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface DonorAggregate {
    principal: Principal;
    totalAmount: bigint;
}
export interface UserProfile {
    favoritePlanet?: string;
    name: string;
    role: UserRole;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getAllStars(): Promise<Array<Star>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDonations(): Promise<Array<Donation>>;
    getJournalEntriesForPlanet(planetName: string): Promise<Array<PlanetJournal>>;
    getStarsByOwner(owner: Principal): Promise<Array<Star>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTopDonors(): Promise<Array<DonorAggregate>>;
    getTotalDonations(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPremiumUser(user: Principal): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    recordDonation(amount: bigint, message: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitJournalEntry(planetName: string, entry: string): Promise<void>;
    submitStar(name: string, message: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
