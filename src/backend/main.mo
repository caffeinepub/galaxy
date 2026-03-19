import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";


(with migration = Migration.run)
actor {
  // Prefabricated module for RBAC
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserRole = { #admin; #user; #guest };
  public type UserProfile = {
    name : Text;
    favoritePlanet : ?Text;
    role : UserRole;
  };

  // Donations
  public type Donation = {
    amount : Nat;
    donor : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  // Star Registry
  public type Star = {
    name : Text;
    owner : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  // Planet Journal
  public type PlanetJournal = {
    planetName : Text;
    author : Principal;
    entry : Text;
    timestamp : Time.Time;
  };

  public type DonorAggregate = {
    principal : Principal;
    totalAmount : Nat;
  };

  // Stripe configuration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // State variables
  let userProfiles = Map.empty<Principal, UserProfile>();
  var totalDonations = 0;
  let donations = List.empty<Donation>();
  let starRegistry = List.empty<Star>();
  let planetJournals = List.empty<PlanetJournal>();

  // Stripe
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // User Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access profiles of other users");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Donations
  public shared ({ caller }) func recordDonation(amount : Nat, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record donations");
    };
    let donation : Donation = {
      amount;
      donor = caller;
      message;
      timestamp = Time.now();
    };
    donations.add(donation);
    totalDonations += amount;
  };

  public query func getTotalDonations() : async Nat {
    totalDonations;
  };

  public query func getDonations() : async [Donation] {
    donations.toArray();
  };

  // Star Registry
  public shared ({ caller }) func submitStar(name : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit stars");
    };
    let star : Star = {
      name;
      owner = caller;
      message;
      timestamp = Time.now();
    };
    starRegistry.add(star);
  };

  public query func getAllStars() : async [Star] {
    starRegistry.toArray();
  };

  public query func getStarsByOwner(owner : Principal) : async [Star] {
    let ownerStars = List.empty<Star>();
    for (star in starRegistry.values()) {
      if (star.owner == owner) {
        ownerStars.add(star);
      };
    };
    ownerStars.toArray();
  };

  // Planet Journals
  public shared ({ caller }) func submitJournalEntry(planetName : Text, entry : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit journal entries");
    };
    let journal : PlanetJournal = {
      planetName;
      author = caller;
      entry;
      timestamp = Time.now();
    };
    planetJournals.add(journal);
  };

  public query func getJournalEntriesForPlanet(planetName : Text) : async [PlanetJournal] {
    let planetEntries = List.empty<PlanetJournal>();
    for (journal in planetJournals.values()) {
      if (journal.planetName == planetName) {
        planetEntries.add(journal);
      };
    };
    let allEntries = planetEntries.toArray();
    let totalEntries = allEntries.size();
    if (totalEntries <= 50) {
      allEntries;
    } else {
      let startIndex = totalEntries - 50 : Nat;
      return allEntries.sliceToArray(startIndex, totalEntries);
    };
  };

  // Leaderboard
  public query func getTopDonors() : async [DonorAggregate] {
    let donorTotals = Map.empty<Principal, Nat>();

    // Aggregate donations per donor
    for (donation in donations.values()) {
      switch (donorTotals.get(donation.donor)) {
        case (?currentTotal) {
          donorTotals.add(donation.donor, currentTotal + donation.amount);
        };
        case (null) {
          donorTotals.add(donation.donor, donation.amount);
        };
      };
    };

    // Convert to array
    let donorAggregates = List.empty<DonorAggregate>();
    for ((donor, total) in donorTotals.entries()) {
      donorAggregates.add({ principal = donor; totalAmount = total });
    };

    // Sort by totalAmount in descending order (highest first)
    let sortedAggregates = donorAggregates.toArray().sort(
      func(a, b) {
        Nat.compare(b.totalAmount, a.totalAmount);
      }
    );

    // Take top 10 donors
    let totalDonors = sortedAggregates.size();
    if (totalDonors <= 10) {
      sortedAggregates;
    } else {
      let topDonors = List.empty<DonorAggregate>();
      var i = 0;
      while (i < 10) {
        topDonors.add(sortedAggregates[i]);
        i += 1;
      };
      topDonors.toArray();
    };
  };

  // Premium Status
  public query func isPremiumUser(user : Principal) : async Bool {
    for (donation in donations.values()) {
      if (donation.donor == user and donation.amount > 0) {
        return true;
      };
    };
    false;
  };
};
