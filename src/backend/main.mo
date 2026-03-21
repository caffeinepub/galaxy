import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Prefabricated module for RBAC
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile types
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

  // Nova Credits
  public type CreditTransaction = {
    amount : Nat;
    timestamp : Time.Time;
    description : Text;
  };

  public type PurchaseRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PurchaseRequest = {
    id : Nat;
    user : Principal;
    transactionHash : Text;
    cryptoType : Text;
    creditsRequested : Nat;
    status : PurchaseRequestStatus;
    timestamp : Time.Time;
  };

  public type LoginRecord = {
    user : Principal;
    timestamp : Time.Time;
  };

  public type AdminStats = {
    totalUsers : Nat;
    totalLoginsToday : Nat;
    totalNovaCredits : Nat;
    pendingPurchases : Nat;
    totalDonations : Nat;
  };

  // NFT Waitlist
  public type NFTWaitlistEntry = {
    user : Principal;
    name : Text;
    walletAddress : Text;
    timestamp : Time.Time;
  };

  // HTTP outcalls transform
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Retained for stable variable compatibility with previous deployment (Stripe was removed from UI)
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // State variables
  let userProfiles = Map.empty<Principal, UserProfile>();
  var totalDonations = 0;
  let donations = List.empty<Donation>();
  let starRegistry = List.empty<Star>();
  let planetJournals = List.empty<PlanetJournal>();

  // Nova Credits
  let userCredits = Map.empty<Principal, Nat>();
  let creditTransactions = List.empty<CreditTransaction>();
  let purchaseRequests = List.empty<PurchaseRequest>();
  let loginActivity = List.empty<LoginRecord>();
  let nftWaitlist = List.empty<NFTWaitlistEntry>();

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

    let donorAggregates = List.empty<DonorAggregate>();
    for ((donor, total) in donorTotals.entries()) {
      donorAggregates.add({ principal = donor; totalAmount = total });
    };

    let sortedAggregates = donorAggregates.toArray().sort(
      func(a, b) {
        Nat.compare(b.totalAmount, a.totalAmount);
      }
    );

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

  // Nova Credits
  public shared ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their balance");
    };
    switch (userCredits.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func earnCredits(amount : Nat, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can earn credits");
    };
    let currentBalance = switch (userCredits.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
    userCredits.add(caller, currentBalance + amount);

    let transaction : CreditTransaction = {
      amount;
      timestamp = Time.now();
      description;
    };
    creditTransactions.add(transaction);
  };

  public shared ({ caller }) func spendCredits(amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can spend credits");
    };
    let currentBalance = switch (userCredits.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (currentBalance < amount) {
      false;
    } else {
      userCredits.add(caller, currentBalance - amount);

      let transaction : CreditTransaction = {
        amount;
        timestamp = Time.now();
        description = "Spent credits";
      };
      creditTransactions.add(transaction);
      true;
    };
  };

  public shared ({ caller }) func submitPurchaseRequest(transactionHash : Text, cryptoType : Text, creditsRequested : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit purchase requests");
    };
    let requestId = purchaseRequests.size();
    let request : PurchaseRequest = {
      id = requestId;
      user = caller;
      transactionHash;
      cryptoType;
      creditsRequested;
      status = #pending;
      timestamp = Time.now();
    };
    purchaseRequests.add(request);
  };

  public query ({ caller }) func getUserPurchaseRequests() : async [PurchaseRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their purchase requests");
    };
    let userRequests = List.empty<PurchaseRequest>();
    for (request in purchaseRequests.values()) {
      if (request.user == caller) {
        userRequests.add(request);
      };
    };
    userRequests.toArray();
  };

  public query ({ caller }) func getAllPurchaseRequests() : async [PurchaseRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all purchase requests");
    };
    purchaseRequests.toArray();
  };

  public shared ({ caller }) func approvePurchaseRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve purchase requests");
    };
    let updatedRequests = List.empty<PurchaseRequest>();

    for (request in purchaseRequests.values()) {
      if (request.id == requestId) {
        let updatedRequest = {
          request with
          status = #approved;
        };
        updatedRequests.add(updatedRequest);

        let currentBalance = switch (userCredits.get(request.user)) {
          case (null) { 0 };
          case (?balance) { balance };
        };
        userCredits.add(request.user, currentBalance + request.creditsRequested);
      } else {
        updatedRequests.add(request);
      };
    };

    purchaseRequests.clear();
    for (request in updatedRequests.values()) {
      purchaseRequests.add(request);
    };
  };

  public shared ({ caller }) func rejectPurchaseRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject purchase requests");
    };
    let updatedRequests = List.empty<PurchaseRequest>();

    for (request in purchaseRequests.values()) {
      if (request.id == requestId) {
        let updatedRequest = {
          request with
          status = #rejected;
        };
        updatedRequests.add(updatedRequest);
      } else {
        updatedRequests.add(request);
      };
    };

    purchaseRequests.clear();
    for (request in updatedRequests.values()) {
      purchaseRequests.add(request);
    };
  };

  // Login tracking
  public shared ({ caller }) func recordLogin() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record login");
    };
    let record : LoginRecord = {
      user = caller;
      timestamp = Time.now();
    };
    loginActivity.add(record);
  };

  public query func getTodayLoginCount() : async Nat {
    let now = Time.now();
    let todayStart = now - (now % 86_400_000_000_000);

    var count = 0;
    for (record in loginActivity.values()) {
      if (record.timestamp >= todayStart) {
        count += 1;
      };
    };
    count;
  };

  public query ({ caller }) func getLoginActivity() : async [LoginRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get login activity");
    };
    loginActivity.toArray();
  };

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get stats");
    };

    let totalUsers = userProfiles.size();
    let now = Time.now();
    let todayStart = now - (now % 86_400_000_000_000);

    var totalLoginsToday = 0;
    for (record in loginActivity.values()) {
      if (record.timestamp >= todayStart) {
        totalLoginsToday += 1;
      };
    };

    var totalNovaCredits = 0;
    let entries = userCredits.entries();
    for ((_, balance) in entries) {
      totalNovaCredits += balance;
    };

    var pendingPurchases = 0;
    for (request in purchaseRequests.values()) {
      if (request.status == #pending) {
        pendingPurchases += 1;
      };
    };

    {
      totalUsers;
      totalLoginsToday;
      totalNovaCredits;
      pendingPurchases;
      totalDonations;
    };
  };

  // NFT Waitlist
  public shared ({ caller }) func submitNFTWaitlist(name : Text, walletAddress : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join the waitlist");
    };
    let entry : NFTWaitlistEntry = {
      user = caller;
      name;
      walletAddress;
      timestamp = Time.now();
    };
    nftWaitlist.add(entry);
  };

  public query ({ caller }) func getNFTWaitlist() : async [NFTWaitlistEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view the NFT waitlist");
    };
    nftWaitlist.toArray();
  };
};
