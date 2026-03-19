import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldUserProfile = {
    name : Text;
    favoritePlanet : ?Text;
    role : { #admin; #user; #guest };
  };

  type OldDonation = {
    amount : Nat;
    donor : Principal.Principal;
    message : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
    totalDonations : Nat;
    donations : List.List<OldDonation>;
  };

  type NewUserProfile = OldUserProfile;
  type NewDonation = OldDonation;
  type Star = {
    name : Text;
    owner : Principal.Principal;
    message : Text;
    timestamp : Time.Time;
  };
  type PlanetJournal = {
    planetName : Text;
    author : Principal.Principal;
    entry : Text;
    timestamp : Time.Time;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, NewUserProfile>;
    totalDonations : Nat;
    donations : List.List<NewDonation>;
    starRegistry : List.List<Star>;
    planetJournals : List.List<PlanetJournal>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      starRegistry = List.empty<Star>();
      planetJournals = List.empty<PlanetJournal>();
    };
  };
};
