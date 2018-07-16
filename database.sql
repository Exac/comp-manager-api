--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: cohort; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cohort (
    cohort_id integer NOT NULL,
    division_state_id integer NOT NULL,
    skater_id integer NOT NULL
);


ALTER TABLE public.cohort OWNER TO postgres;

--
-- Name: TABLE cohort; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cohort IS 'Junction table: list of skaters in their division.';


--
-- Name: cohort_cohort_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cohort_cohort_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cohort_cohort_id_seq OWNER TO postgres;

--
-- Name: cohort_cohort_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cohort_cohort_id_seq OWNED BY public.cohort.cohort_id;


--
-- Name: competitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitions (
    competition_id integer NOT NULL,
    user_id integer DEFAULT 1 NOT NULL,
    protocol_id integer DEFAULT 1 NOT NULL,
    name character varying NOT NULL,
    join_token character varying(60) NOT NULL,
    creation_time timestamp with time zone DEFAULT date_trunc('second'::text, now()),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    location character varying(255) NOT NULL
);


ALTER TABLE public.competitions OWNER TO postgres;

--
-- Name: COLUMN competitions.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.user_id IS 'The user that created this competition.';


--
-- Name: COLUMN competitions.protocol_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.protocol_id IS 'The protocol that this competition uses.';


--
-- Name: COLUMN competitions.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.name IS 'Name of the competition.';


--
-- Name: COLUMN competitions.join_token; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.join_token IS 'Join token for assistant recorders.';


--
-- Name: COLUMN competitions.start_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.start_date IS 'Competition''s start date.';


--
-- Name: COLUMN competitions.end_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.end_date IS 'Competition''s last day.';


--
-- Name: COLUMN competitions.location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.competitions.location IS 'City';


--
-- Name: competitions_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.competitions_competition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.competitions_competition_id_seq OWNER TO postgres;

--
-- Name: competitions_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.competitions_competition_id_seq OWNED BY public.competitions.competition_id;


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisions (
    divisions_id integer NOT NULL,
    competition_id integer NOT NULL,
    current_state character varying DEFAULT 'warmup'::character varying NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.divisions OWNER TO postgres;

--
-- Name: divisions_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisions_states (
    division_state_id integer NOT NULL,
    competition_id integer NOT NULL,
    state character varying
);


ALTER TABLE public.divisions_states OWNER TO postgres;

--
-- Name: TABLE divisions_states; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.divisions_states IS 'Divisions in their competition.';


--
-- Name: COLUMN divisions_states.competition_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.divisions_states.competition_id IS 'The competition this divison is a part of.';


--
-- Name: COLUMN divisions_states.state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.divisions_states.state IS 'The name of the competition.';


--
-- Name: divisions_division_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.divisions_division_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.divisions_division_id_seq OWNER TO postgres;

--
-- Name: divisions_division_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.divisions_division_id_seq OWNED BY public.divisions_states.division_state_id;


--
-- Name: divisions_divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.divisions_divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.divisions_divisions_id_seq OWNER TO postgres;

--
-- Name: divisions_divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.divisions_divisions_id_seq OWNED BY public.divisions.divisions_id;


--
-- Name: protocols; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocols (
    protocol_id integer NOT NULL,
    protocol character varying,
    is_custom boolean DEFAULT false NOT NULL,
    json character varying
);


ALTER TABLE public.protocols OWNER TO postgres;

--
-- Name: protocols_protocol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.protocols_protocol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.protocols_protocol_id_seq OWNER TO postgres;

--
-- Name: protocols_protocol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.protocols_protocol_id_seq OWNED BY public.protocols.protocol_id;


--
-- Name: races; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.races (
    race_id integer NOT NULL,
    division_state_id integer NOT NULL,
    distance integer NOT NULL,
    track character varying(5) DEFAULT '400i'::character varying NOT NULL,
    type character varying DEFAULT 'olympic'::character varying NOT NULL,
    distance_name character varying(35) DEFAULT 'Race'::character varying NOT NULL,
    x_race smallint DEFAULT 1 NOT NULL,
    y_round smallint DEFAULT 1 NOT NULL,
    z_group smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.races OWNER TO postgres;

--
-- Name: races_race_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.races_race_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.races_race_id_seq OWNER TO postgres;

--
-- Name: races_race_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.races_race_id_seq OWNED BY public.races.race_id;


--
-- Name: records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.records (
    record_id integer NOT NULL,
    race_id integer NOT NULL,
    cohort_id integer NOT NULL,
    "time" numeric(8,4) NOT NULL,
    place smallint NOT NULL,
    start_line_position smallint NOT NULL,
    advance_as_time numeric(8,4),
    advance_as_place smallint,
    is_dnf boolean DEFAULT false NOT NULL,
    is_dq boolean DEFAULT false NOT NULL,
    is_dns boolean DEFAULT false NOT NULL,
    is_wdr boolean DEFAULT false NOT NULL,
    is_rs boolean DEFAULT false NOT NULL,
    is_mt boolean DEFAULT false NOT NULL,
    is_yellow_card boolean DEFAULT false NOT NULL,
    is_red_card boolean DEFAULT false NOT NULL
);


ALTER TABLE public.records OWNER TO postgres;

--
-- Name: records_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.records_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.records_records_id_seq OWNER TO postgres;

--
-- Name: records_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.records_records_id_seq OWNED BY public.records.record_id;


--
-- Name: registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration (
    registration_id integer NOT NULL,
    competition_id integer NOT NULL,
    skater_id integer NOT NULL,
    registered_timestamp timestamp with time zone DEFAULT date_trunc('second'::text, now()) NOT NULL
);


ALTER TABLE public.registration OWNER TO postgres;

--
-- Name: TABLE registration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.registration IS 'Registration list for competition.';


--
-- Name: registration_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_registration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registration_registration_id_seq OWNER TO postgres;

--
-- Name: registration_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_registration_id_seq OWNED BY public.registration.registration_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: chollima
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO chollima;

--
-- Name: skaters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skaters (
    skater_id integer NOT NULL,
    ssc_id integer,
    isu_id character varying,
    birth_date timestamp with time zone,
    sex character varying(1) DEFAULT 'm'::character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying(35),
    country character varying(35),
    state character varying(35),
    city character varying(35),
    address character varying(35),
    club character varying(35)
);


ALTER TABLE public.skaters OWNER TO postgres;

--
-- Name: TABLE skaters; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.skaters IS 'Skaters';


--
-- Name: COLUMN skaters.ssc_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.skaters.ssc_id IS 'Speed skating canada number.';


--
-- Name: COLUMN skaters.isu_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.skaters.isu_id IS 'ISU identification.';


--
-- Name: COLUMN skaters.birth_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.skaters.birth_date IS 'Date of birth.';


--
-- Name: COLUMN skaters.sex; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.skaters.sex IS 'Skaters biological sex, "m" or "f".';


--
-- Name: COLUMN skaters.address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.skaters.address IS 'Skater''s address (useful for calculating sub-zones, etc)';


--
-- Name: skaters_skater_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skaters_skater_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.skaters_skater_id_seq OWNER TO postgres;

--
-- Name: skaters_skater_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skaters_skater_id_seq OWNED BY public.skaters.skater_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    alias character varying(18) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(60) NOT NULL,
    recovery character varying(60),
    recovery_expire timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: cohort cohort_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort ALTER COLUMN cohort_id SET DEFAULT nextval('public.cohort_cohort_id_seq'::regclass);


--
-- Name: competitions competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions ALTER COLUMN competition_id SET DEFAULT nextval('public.competitions_competition_id_seq'::regclass);


--
-- Name: divisions divisions_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions ALTER COLUMN divisions_id SET DEFAULT nextval('public.divisions_divisions_id_seq'::regclass);


--
-- Name: divisions_states division_state_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions_states ALTER COLUMN division_state_id SET DEFAULT nextval('public.divisions_division_id_seq'::regclass);


--
-- Name: protocols protocol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols ALTER COLUMN protocol_id SET DEFAULT nextval('public.protocols_protocol_id_seq'::regclass);


--
-- Name: races race_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.races ALTER COLUMN race_id SET DEFAULT nextval('public.races_race_id_seq'::regclass);


--
-- Name: records record_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records ALTER COLUMN record_id SET DEFAULT nextval('public.records_records_id_seq'::regclass);


--
-- Name: registration registration_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration ALTER COLUMN registration_id SET DEFAULT nextval('public.registration_registration_id_seq'::regclass);


--
-- Name: skaters skater_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skaters ALTER COLUMN skater_id SET DEFAULT nextval('public.skaters_skater_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: cohort cohort_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort
    ADD CONSTRAINT cohort_pk PRIMARY KEY (cohort_id);


--
-- Name: competitions competitions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_pk PRIMARY KEY (competition_id);


--
-- Name: divisions divisions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pk PRIMARY KEY (divisions_id);


--
-- Name: divisions_states divisions_states_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions_states
    ADD CONSTRAINT divisions_states_pk PRIMARY KEY (division_state_id);


--
-- Name: protocols protocols_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols
    ADD CONSTRAINT protocols_pk PRIMARY KEY (protocol_id);


--
-- Name: races races_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.races
    ADD CONSTRAINT races_pk PRIMARY KEY (race_id);


--
-- Name: records records_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_pk PRIMARY KEY (record_id);


--
-- Name: registration registration_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_pk PRIMARY KEY (registration_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: chollima
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: skaters skaters_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skaters
    ADD CONSTRAINT skaters_pk PRIMARY KEY (skater_id);


--
-- Name: skaters skaters_un; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skaters
    ADD CONSTRAINT skaters_un UNIQUE (ssc_id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: users users_un; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_un UNIQUE (email, alias);


--
-- Name: competitions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX competitions_user_id_idx ON public.competitions USING btree (user_id);


--
-- Name: cohort cohort_divisions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort
    ADD CONSTRAINT cohort_divisions_fk FOREIGN KEY (division_state_id) REFERENCES public.divisions_states(division_state_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohort cohort_skaters_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort
    ADD CONSTRAINT cohort_skaters_fk FOREIGN KEY (skater_id) REFERENCES public.skaters(skater_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: competitions competitions_protocols_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_protocols_fk FOREIGN KEY (protocol_id) REFERENCES public.protocols(protocol_id) ON DELETE SET DEFAULT;


--
-- Name: competitions competitions_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_users_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT;


--
-- Name: divisions_states divisions_competitions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions_states
    ADD CONSTRAINT divisions_competitions_fk FOREIGN KEY (competition_id) REFERENCES public.competitions(competition_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: divisions divisions_competitions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_competitions_fk FOREIGN KEY (competition_id) REFERENCES public.competitions(competition_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: races races_divisions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.races
    ADD CONSTRAINT races_divisions_fk FOREIGN KEY (division_state_id) REFERENCES public.divisions_states(division_state_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: records records_cohort_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_cohort_fk FOREIGN KEY (cohort_id) REFERENCES public.cohort(cohort_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: records records_races_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_races_fk FOREIGN KEY (race_id) REFERENCES public.races(race_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registration registration_competitions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_competitions_fk FOREIGN KEY (competition_id) REFERENCES public.competitions(competition_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registration registration_skaters_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_skaters_fk FOREIGN KEY (skater_id) REFERENCES public.skaters(skater_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TABLE cohort; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cohort TO chollima;
GRANT ALL ON TABLE public.cohort TO thomas;


--
-- Name: TABLE competitions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.competitions TO chollima;
GRANT ALL ON TABLE public.competitions TO thomas;


--
-- Name: TABLE divisions_states; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.divisions_states TO chollima;
GRANT ALL ON TABLE public.divisions_states TO thomas;


--
-- Name: TABLE protocols; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.protocols TO chollima;
GRANT ALL ON TABLE public.protocols TO thomas;


--
-- Name: TABLE races; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.races TO chollima;
GRANT ALL ON TABLE public.races TO thomas;


--
-- Name: TABLE records; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.records TO chollima;
GRANT ALL ON TABLE public.records TO thomas;


--
-- Name: TABLE registration; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registration TO chollima;
GRANT ALL ON TABLE public.registration TO thomas;


--
-- Name: TABLE session; Type: ACL; Schema: public; Owner: chollima
--

GRANT ALL ON TABLE public.session TO postgres;
GRANT ALL ON TABLE public.session TO thomas;


--
-- Name: TABLE skaters; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.skaters TO chollima;
GRANT ALL ON TABLE public.skaters TO thomas;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO chollima;
GRANT ALL ON TABLE public.users TO thomas;


--
-- PostgreSQL database dump complete
--

