import Stripe "stripe/stripe";
import Iter "mo:core/Iter";
import List "mo:core/List";

import Map "mo:core/Map";
import Nat "mo:core/Nat";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration on upgrade

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserRole = { #admin; #user; #guest };
  public type Score = Nat;

  public type UserProfile = {
    name : Text;
    favoritePlanet : ?Text;
    role : UserRole;
  };

  public type Donation = {
    amount : Nat;
    donor : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  public type Star = {
    name : Text;
    owner : Principal;
    message : Text;
    timestamp : Time.Time;
  };

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

  public type NFTWaitlistEntry = {
    user : Principal;
    name : Text;
    walletAddress : Text;
    timestamp : Time.Time;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe integration (kept for API compatibility)
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // ─── Stable primitive state ───────────────────────────────────────────────
  // These survive upgrades without preupgrade/postupgrade
  stable var adminClaimed = false;
  stable var totalDonations : Nat = 0;
  stable var adminPrincipal : ?Principal = null;

  // ─── Stable backing storage for collections ───────────────────────────────
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableUserCredits : [(Principal, Nat)] = [];
  stable var stableDonations : [Donation] = [];
  stable var stableStarRegistry : [Star] = [];
  stable var stablePlanetJournals : [PlanetJournal] = [];
  stable var stablePurchaseRequests : [PurchaseRequest] = [];
  stable var stableLoginActivity : [LoginRecord] = [];
  stable var stableGameLeaderboard : [(Principal, Nat)] = [];
  stable var stableNFTWaitlist : [NFTWaitlistEntry] = [];

  // ─── Mutable live collections (reconstructed on upgrade) ──────────────────
  var userProfiles = Map.empty<Principal, UserProfile>();
  let donations = List.empty<Donation>();
  let starRegistry = List.empty<Star>();
  let planetJournals = List.empty<PlanetJournal>();
  let userCredits = Map.empty<Principal, Nat>();
  let creditTransactions = List.empty<CreditTransaction>();
  let purchaseRequests = List.empty<PurchaseRequest>();
  let loginActivity = List.empty<LoginRecord>();
  let nftWaitlist = List.empty<NFTWaitlistEntry>();
  let outcallResults = List.empty<Text>();
  let gameLeaderboard = Map.empty<Principal, Nat>();

  // ─── Upgrade hooks ────────────────────────────────────────────────────────

  system func preupgrade() {
    // Snapshot mutable Maps to stable arrays
    let upBuf = List.empty<(Principal, UserProfile)>();
    for (entry in userProfiles.entries()) { upBuf.add(entry) };
    stableUserProfiles := upBuf.toArray();

    let ucBuf = List.empty<(Principal, Nat)>();
    for (entry in userCredits.entries()) { ucBuf.add(entry) };
    stableUserCredits := ucBuf.toArray();

    let glBuf = List.empty<(Principal, Nat)>();
    for (entry in gameLeaderboard.entries()) { glBuf.add(entry) };
    stableGameLeaderboard := glBuf.toArray();

    // Snapshot Lists
    stableDonations := donations.toArray();
    stableStarRegistry := starRegistry.toArray();
    stablePlanetJournals := planetJournals.toArray();
    stablePurchaseRequests := purchaseRequests.toArray();
    stableLoginActivity := loginActivity.toArray();
    stableNFTWaitlist := nftWaitlist.toArray();
  };

  system func postupgrade() {
    // Restore Maps
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.add(k, v) };
    for ((k, v) in stableUserCredits.vals()) { userCredits.add(k, v) };
    for ((k, v) in stableGameLeaderboard.vals()) { gameLeaderboard.add(k, v) };

    // Restore Lists
    for (d in stableDonations.vals()) { donations.add(d) };
    for (s in stableStarRegistry.vals()) { starRegistry.add(s) };
    for (j in stablePlanetJournals.vals()) { planetJournals.add(j) };
    for (p in stablePurchaseRequests.vals()) { purchaseRequests.add(p) };
    for (l in stableLoginActivity.vals()) { loginActivity.add(l) };
    for (n in stableNFTWaitlist.vals()) { nftWaitlist.add(n) };

    // Restore admin role in AccessControl (survives upgrades)
    switch (adminPrincipal) {
      case (?p) {
        AccessControl.assignRole(accessControlState, p, p, #admin);
      };
      case (null) {};
    };
  };

  // ─── Admin management ─────────────────────────────────────────────────────

  public query func hasAdmin() : async Bool {
    adminClaimed;
  };


  public shared ({ caller }) func claimAdmin() : async () {
    if (adminClaimed) {
      Runtime.trap("Admin already claimed");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminClaimed := true;
    adminPrincipal := ?caller;
  };

  // ─── Game Leaderboard ─────────────────────────────────────────────────────

  public type GameLeaderboardEntry = {
    principal : Principal;
    totalGameCredits : Nat;
  };

  public shared ({ caller }) func recordGameCreditsEarned(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record game credits");
    };
    let currentTotal = switch (gameLeaderboard.get(caller)) {
      case (null) { 0 };
      case (?total) { total };
    };
    gameLeaderboard.add(caller, currentTotal + amount);
  };

  public query func getGameLeaderboard() : async [GameLeaderboardEntry] {
    let entries = List.empty<GameLeaderboardEntry>();
    for ((principal, total) in gameLeaderboard.entries()) {
      if (total > 0) {
        entries.add({
          principal;
          totalGameCredits = total;
        });
      };
    };
    let entriesArray = entries.toArray();
    if (entriesArray.size() <= 20) {
      entriesArray;
    } else {
      let sortedEntries = entriesArray.sort(
        func(a, b) {
          Nat.compare(b.totalGameCredits, a.totalGameCredits);
        }
      );
      sortedEntries.sliceToArray(0, 20);
    };
  };

  // ─── User Management ──────────────────────────────────────────────────────

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

  // ─── Donations ────────────────────────────────────────────────────────────

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

  // ─── Star Registry ────────────────────────────────────────────────────────

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

  // ─── Planet Journals ──────────────────────────────────────────────────────

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

  // ─── Leaderboard (Donations) ──────────────────────────────────────────────

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

  // ─── Premium Status ───────────────────────────────────────────────────────

  public query func isPremiumUser(user : Principal) : async Bool {
    for (donation in donations.values()) {
      if (donation.donor == user and donation.amount > 0) {
        return true;
      };
    };
    false;
  };

  // ─── Nova Credits ─────────────────────────────────────────────────────────

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

  // ─── Login tracking ───────────────────────────────────────────────────────

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

  // ─── NFT Waitlist (kept for API compatibility) ────────────────────────────

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
