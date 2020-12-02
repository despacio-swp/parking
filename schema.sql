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
    pricePerHour integer NOT NULL,
    lotDescription text,
    lotPhoto bytea
);

CREATE TABLE protests (
    protestId text PRIMARY KEY,
    userId text REFERENCES accounts (userId) NOT NULL,
    protestDate text NOT NULL,
    protestName text NOT NULL,
    email text NOT NULL,
    protestAddress text NOT NULL, 
    phoneNumber text,
    protestDescription text,
    protestPhoto bytea
);

CREATE TABLE links (
    linkId text PRIMARY KEY,
    protestId text REFERENCES protests (protestId) NOT NULL,
    protestAddress text REFERENCES protests (protestAddress) NOT NULL,
    lotId text REFERENCES parkingLots (lotId) NOT NULL,
    lotAddress text REFERENCES parkignLots (lotAddress) NOT NULL
)

CREATE TABLE lotOccupancy (
    plateId text REFERENCES vehicles (plateId) NOT NULL,
    lotId text REFERENCES parkingLots (lotId) NOT NULL
);
