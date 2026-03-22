import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; favoritePlanet : ?Text; role : { #admin; #user; #guest } }>;
    totalDonations : Nat;
    donations : List.List<{ amount : Nat; donor : Principal; message : Text; timestamp : Int }>;
    starRegistry : List.List<{ name : Text; owner : Principal; message : Text; timestamp : Int }>;
    planetJournals : List.List<{ planetName : Text; author : Principal; entry : Text; timestamp : Int }>;
    userCredits : Map.Map<Principal, Nat>;
    creditTransactions : List.List<{ amount : Nat; timestamp : Int; description : Text }>;
    purchaseRequests : List.List<{ id : Nat; user : Principal; transactionHash : Text; cryptoType : Text; creditsRequested : Nat; status : { #pending; #approved; #rejected }; timestamp : Int }>;
    loginActivity : List.List<{ user : Principal; timestamp : Int }>;
    nftWaitlist : List.List<{ user : Principal; name : Text; walletAddress : Text; timestamp : Int }>;
    stripeConfiguration : ?{ secretKey : Text; allowedCountries : [Text] };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; favoritePlanet : ?Text; role : { #admin; #user; #guest } }>;
    totalDonations : Nat;
    donations : List.List<{ amount : Nat; donor : Principal; message : Text; timestamp : Int }>;
    starRegistry : List.List<{ name : Text; owner : Principal; message : Text; timestamp : Int }>;
    planetJournals : List.List<{ planetName : Text; author : Principal; entry : Text; timestamp : Int }>;
    userCredits : Map.Map<Principal, Nat>;
    creditTransactions : List.List<{ amount : Nat; timestamp : Int; description : Text }>;
    purchaseRequests : List.List<{ id : Nat; user : Principal; transactionHash : Text; cryptoType : Text; creditsRequested : Nat; status : { #pending; #approved; #rejected }; timestamp : Int }>;
    loginActivity : List.List<{ user : Principal; timestamp : Int }>;
    nftWaitlist : List.List<{ user : Principal; name : Text; walletAddress : Text; timestamp : Int }>;
    stripeConfiguration : ?{ secretKey : Text; allowedCountries : [Text] };
    gameLeaderboard : Map.Map<Principal, Nat>;
    adminClaimed : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      gameLeaderboard = Map.empty<Principal, Nat>();
      adminClaimed = false;
    };
  };
};
