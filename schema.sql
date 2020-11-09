CREATE TABLE accounts (
    userId text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    firstName text NOT NULL,
    lastName text NOT NULL,
    profilePhoto bytea,
    isLotOwner boolean NOT NULL
);

CREATE TABLE sessions (
    token text PRIMARY KEY,
    userId text NOT NULL,
    expires timestamp
);

CREATE TABLE vehicles (
    plateId text PRIMARY KEY,
    userId text REFERENCES accounts (userId) NOT NULL
);

CREATE TABLE paymentLinks (
    paymentLink text PRIMARY KEY,
    userId text REFERENCES accounts (userId) NOT NULL
);

CREATE TABLE parkingLots (
    lotId text PRIMARY KEY,
    userId text REFERENCES accounts (userId) NOT NULL,
    capacity integer NOT NULL,
    lotAddress text NOT NULL,
    lotDescription text,
    lotPhoto bytea,
    tags text[] NOT NULL
);

CREATE TABLE lotOccupancy (
    plateId text REFERENCES vehicles (plateId) NOT NULL,
    lotId text REFERENCES parkingLots (lotId) NOT NULL
);
