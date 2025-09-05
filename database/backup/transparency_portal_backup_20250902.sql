--
-- PostgreSQL database dump
--

\restrict Utqzu58oCZK5vdiSZo7hZazzfDuUami0GVZXNqrCc5qH1QmQaLhG40Damw3f71J

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: archive; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA archive;


ALTER SCHEMA archive OWNER TO postgres;

--
-- Name: SCHEMA archive; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA archive IS 'Historical archived data';


--
-- Name: metadata; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA metadata;


ALTER SCHEMA metadata OWNER TO postgres;

--
-- Name: SCHEMA metadata; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA metadata IS 'System metadata and configuration';


--
-- Name: transparency; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA transparency;


ALTER SCHEMA transparency OWNER TO postgres;

--
-- Name: SCHEMA transparency; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA transparency IS 'Current transparency data';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: budget_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_data (
    id integer NOT NULL,
    document_id integer,
    year integer,
    category character varying(255),
    subcategory character varying(255),
    budgeted_amount numeric(15,2),
    executed_amount numeric(15,2),
    execution_percentage numeric(5,2),
    quarter integer,
    extraction_confidence numeric(3,2)
);


ALTER TABLE public.budget_data OWNER TO postgres;

--
-- Name: budget_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budget_data_id_seq OWNER TO postgres;

--
-- Name: budget_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_data_id_seq OWNED BY public.budget_data.id;


--
-- Name: budget_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_execution (
    id integer NOT NULL,
    document_id integer,
    year integer,
    quarter integer,
    category character varying(100),
    budgeted_amount numeric(15,2),
    executed_amount numeric(15,2),
    execution_percentage numeric(5,2),
    variance_amount numeric(15,2),
    department character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.budget_execution OWNER TO postgres;

--
-- Name: budget_execution_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_execution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budget_execution_id_seq OWNER TO postgres;

--
-- Name: budget_execution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_execution_id_seq OWNED BY public.budget_execution.id;


--
-- Name: contract_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_details (
    id integer NOT NULL,
    document_id integer,
    contract_number character varying(100),
    title text,
    contractor character varying(500),
    amount numeric(15,2),
    contract_date date,
    execution_period integer,
    status character varying(100),
    category character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_details OWNER TO postgres;

--
-- Name: contract_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contract_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contract_details_id_seq OWNER TO postgres;

--
-- Name: contract_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contract_details_id_seq OWNED BY public.contract_details.id;


--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_sources (
    id integer NOT NULL,
    source_type character varying(50),
    source_name character varying(100),
    url text,
    status character varying(50),
    last_processed timestamp without time zone,
    records_count integer DEFAULT 0,
    processing_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.data_sources OWNER TO postgres;

--
-- Name: data_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.data_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_sources_id_seq OWNER TO postgres;

--
-- Name: data_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.data_sources_id_seq OWNED BY public.data_sources.id;


--
-- Name: document_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_content (
    id integer NOT NULL,
    document_id integer,
    page_number integer,
    content_type character varying(50),
    raw_content text,
    structured_data text,
    searchable_text text,
    metadata text
);


ALTER TABLE public.document_content OWNER TO postgres;

--
-- Name: document_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.document_content_id_seq OWNER TO postgres;

--
-- Name: document_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_content_id_seq OWNED BY public.document_content.id;


--
-- Name: document_relationships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_relationships (
    id integer NOT NULL,
    primary_doc_id integer,
    related_doc_id integer,
    relationship_type character varying(50),
    confidence_score numeric(3,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_relationships OWNER TO postgres;

--
-- Name: document_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.document_relationships_id_seq OWNER TO postgres;

--
-- Name: document_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_relationships_id_seq OWNED BY public.document_relationships.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    original_path text,
    markdown_path text,
    document_type character varying(100),
    category character varying(100),
    year integer,
    file_size bigint,
    file_hash character varying(64),
    verification_status character varying(50),
    official_url text,
    archive_url text,
    extraction_method character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: extracted_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extracted_data (
    id integer NOT NULL,
    document_id integer,
    data_type character varying(50),
    table_data jsonb,
    key_values jsonb,
    extracted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.extracted_data OWNER TO postgres;

--
-- Name: extracted_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extracted_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extracted_data_id_seq OWNER TO postgres;

--
-- Name: extracted_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extracted_data_id_seq OWNED BY public.extracted_data.id;


--
-- Name: extracted_financial_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extracted_financial_data (
    id integer NOT NULL,
    document_id integer,
    data_type character varying(50),
    category character varying(100),
    extracted_text text,
    amounts jsonb,
    dates jsonb,
    entities jsonb,
    metadata jsonb,
    confidence_score numeric(3,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.extracted_financial_data OWNER TO postgres;

--
-- Name: extracted_financial_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extracted_financial_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extracted_financial_data_id_seq OWNER TO postgres;

--
-- Name: extracted_financial_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extracted_financial_data_id_seq OWNED BY public.extracted_financial_data.id;


--
-- Name: fee_rights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_rights (
    id integer NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    description text,
    revenue numeric(15,2),
    collection_efficiency numeric(5,2),
    document_hash character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fee_rights OWNER TO postgres;

--
-- Name: fee_rights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_rights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fee_rights_id_seq OWNER TO postgres;

--
-- Name: fee_rights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_rights_id_seq OWNED BY public.fee_rights.id;


--
-- Name: fees_rights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fees_rights (
    id integer NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    description text,
    revenue numeric(15,2),
    collection_efficiency numeric(5,2)
);


ALTER TABLE public.fees_rights OWNER TO postgres;

--
-- Name: fees_rights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fees_rights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fees_rights_id_seq OWNER TO postgres;

--
-- Name: fees_rights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fees_rights_id_seq OWNED BY public.fees_rights.id;


--
-- Name: financial_indicators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_indicators (
    id integer NOT NULL,
    year integer NOT NULL,
    indicator_name character varying(255),
    value numeric(15,2),
    description text,
    comparison_previous_year numeric(5,2)
);


ALTER TABLE public.financial_indicators OWNER TO postgres;

--
-- Name: financial_indicators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_indicators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financial_indicators_id_seq OWNER TO postgres;

--
-- Name: financial_indicators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_indicators_id_seq OWNED BY public.financial_indicators.id;


--
-- Name: financial_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_reports (
    id integer NOT NULL,
    year integer NOT NULL,
    quarter integer,
    report_type character varying(255),
    income numeric(15,2),
    expenses numeric(15,2),
    balance numeric(15,2),
    execution_percentage numeric(5,2)
);


ALTER TABLE public.financial_reports OWNER TO postgres;

--
-- Name: financial_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financial_reports_id_seq OWNER TO postgres;

--
-- Name: financial_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_reports_id_seq OWNED BY public.financial_reports.id;


--
-- Name: found_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.found_documents (
    id integer NOT NULL,
    source_id integer,
    url text,
    title text,
    document_type character varying(100),
    estimated_year integer,
    file_size bigint,
    download_status character varying(50) DEFAULT 'pending'::character varying,
    content_hash character varying(64),
    local_path text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.found_documents OWNER TO postgres;

--
-- Name: found_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.found_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.found_documents_id_seq OWNER TO postgres;

--
-- Name: found_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.found_documents_id_seq OWNED BY public.found_documents.id;


--
-- Name: historical_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historical_snapshots (
    id integer NOT NULL,
    original_url text,
    archive_url text,
    snapshot_date date,
    archive_service character varying(50),
    content_hash character varying(64),
    status character varying(50),
    documents_found integer DEFAULT 0,
    processed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.historical_snapshots OWNER TO postgres;

--
-- Name: historical_snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historical_snapshots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.historical_snapshots_id_seq OWNER TO postgres;

--
-- Name: historical_snapshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historical_snapshots_id_seq OWNED BY public.historical_snapshots.id;


--
-- Name: integration_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_log (
    id integer NOT NULL,
    process_type character varying(50),
    source_id integer,
    status character varying(50),
    records_processed integer DEFAULT 0,
    errors_count integer DEFAULT 0,
    processing_time integer,
    details jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.integration_log OWNER TO postgres;

--
-- Name: integration_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_log_id_seq OWNER TO postgres;

--
-- Name: integration_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_log_id_seq OWNED BY public.integration_log.id;


--
-- Name: investments_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investments_assets (
    id integer NOT NULL,
    year integer NOT NULL,
    asset_type character varying(255),
    description text,
    value numeric(15,2),
    depreciation numeric(15,2),
    location character varying(255)
);


ALTER TABLE public.investments_assets OWNER TO postgres;

--
-- Name: investments_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.investments_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.investments_assets_id_seq OWNER TO postgres;

--
-- Name: investments_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.investments_assets_id_seq OWNED BY public.investments_assets.id;


--
-- Name: municipal_debt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.municipal_debt (
    id integer NOT NULL,
    year integer NOT NULL,
    debt_type character varying(255),
    description text,
    amount numeric(15,2),
    interest_rate numeric(5,2),
    due_date timestamp with time zone,
    status character varying(255)
);


ALTER TABLE public.municipal_debt OWNER TO postgres;

--
-- Name: municipal_debt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.municipal_debt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.municipal_debt_id_seq OWNER TO postgres;

--
-- Name: municipal_debt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.municipal_debt_id_seq OWNED BY public.municipal_debt.id;


--
-- Name: operational_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operational_expenses (
    id integer NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    description text,
    amount numeric(15,2),
    administrative_analysis text
);


ALTER TABLE public.operational_expenses OWNER TO postgres;

--
-- Name: operational_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operational_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operational_expenses_id_seq OWNER TO postgres;

--
-- Name: operational_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operational_expenses_id_seq OWNED BY public.operational_expenses.id;


--
-- Name: processed_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processed_documents (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    year integer NOT NULL,
    file_type character varying(10),
    size_bytes bigint,
    sha256_hash character varying(64),
    document_type character varying(100),
    category character varying(100),
    priority character varying(20),
    keywords text[],
    official_url text,
    archive_url text,
    processing_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.processed_documents OWNER TO postgres;

--
-- Name: processed_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.processed_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.processed_documents_id_seq OWNER TO postgres;

--
-- Name: processed_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.processed_documents_id_seq OWNED BY public.processed_documents.id;


--
-- Name: processing_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processing_log (
    id integer NOT NULL,
    filename character varying(255),
    action character varying(50),
    status character varying(20),
    message text,
    processed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.processing_log OWNER TO postgres;

--
-- Name: processing_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.processing_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.processing_log_id_seq OWNER TO postgres;

--
-- Name: processing_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.processing_log_id_seq OWNED BY public.processing_log.id;


--
-- Name: property_declarations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_declarations (
    id integer NOT NULL,
    year integer NOT NULL,
    official_name character varying(255) NOT NULL,
    role character varying(255),
    cuil character varying(255),
    declaration_date timestamp with time zone,
    status character varying(255),
    uuid character varying(255),
    observations text,
    public_verification text,
    critical_review text
);


ALTER TABLE public.property_declarations OWNER TO postgres;

--
-- Name: property_declarations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.property_declarations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.property_declarations_id_seq OWNER TO postgres;

--
-- Name: property_declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.property_declarations_id_seq OWNED BY public.property_declarations.id;


--
-- Name: public_tenders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.public_tenders (
    id integer NOT NULL,
    year integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    budget numeric(12,2),
    awarded_to character varying(255),
    award_date timestamp with time zone,
    execution_status character varying(255),
    delay_analysis text
);


ALTER TABLE public.public_tenders OWNER TO postgres;

--
-- Name: public_tenders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.public_tenders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.public_tenders_id_seq OWNER TO postgres;

--
-- Name: public_tenders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.public_tenders_id_seq OWNED BY public.public_tenders.id;


--
-- Name: salaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salaries (
    id integer NOT NULL,
    year integer NOT NULL,
    official_name character varying(255) NOT NULL,
    role character varying(255),
    basic_salary numeric(12,2),
    adjustments text,
    deductions text,
    net_salary numeric(12,2),
    inflation_rate numeric(5,2)
);


ALTER TABLE public.salaries OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.salaries_id_seq OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salaries_id_seq OWNED BY public.salaries.id;


--
-- Name: salary_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_details (
    id integer NOT NULL,
    document_id integer,
    employee_name character varying(255),
    "position" character varying(255),
    department character varying(255),
    basic_salary numeric(12,2),
    bonuses numeric(12,2),
    deductions numeric(12,2),
    net_salary numeric(12,2),
    period_year integer,
    period_month integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.salary_details OWNER TO postgres;

--
-- Name: salary_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.salary_details_id_seq OWNER TO postgres;

--
-- Name: salary_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_details_id_seq OWNED BY public.salary_details.id;


--
-- Name: scraped_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scraped_sources (
    id integer NOT NULL,
    source_name character varying(100),
    url text,
    content_hash character varying(64),
    last_scraped timestamp without time zone DEFAULT now(),
    status character varying(50),
    response_time integer,
    content_size integer,
    documents_found integer DEFAULT 0
);


ALTER TABLE public.scraped_sources OWNER TO postgres;

--
-- Name: scraped_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scraped_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scraped_sources_id_seq OWNER TO postgres;

--
-- Name: scraped_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scraped_sources_id_seq OWNED BY public.scraped_sources.id;


--
-- Name: transparency_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transparency_documents (
    id integer NOT NULL,
    filename character varying(500),
    original_path text,
    category character varying(100),
    document_type character varying(50),
    year integer,
    quarter integer,
    month character varying(20),
    content_preview text,
    file_hash character varying(64),
    file_size bigint,
    processing_status character varying(50) DEFAULT 'processed'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transparency_documents OWNER TO postgres;

--
-- Name: transparency_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transparency_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transparency_documents_id_seq OWNER TO postgres;

--
-- Name: transparency_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transparency_documents_id_seq OWNED BY public.transparency_documents.id;


--
-- Name: treasury_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treasury_movements (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    description text,
    category character varying(255),
    amount numeric(15,2),
    balance numeric(15,2),
    debt_tracking text
);


ALTER TABLE public.treasury_movements OWNER TO postgres;

--
-- Name: treasury_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treasury_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.treasury_movements_id_seq OWNER TO postgres;

--
-- Name: treasury_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treasury_movements_id_seq OWNED BY public.treasury_movements.id;


--
-- Name: verification_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_audit (
    id integer NOT NULL,
    document_id integer,
    verification_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verification_method character varying(100),
    verification_result character varying(50),
    cross_reference_sources text,
    integrity_check_passed boolean,
    osint_compliance_status character varying(50),
    notes text
);


ALTER TABLE public.verification_audit OWNER TO postgres;

--
-- Name: verification_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verification_audit_id_seq OWNER TO postgres;

--
-- Name: verification_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verification_audit_id_seq OWNED BY public.verification_audit.id;


--
-- Name: documents; Type: TABLE; Schema: transparency; Owner: postgres
--

CREATE TABLE transparency.documents (
    id integer NOT NULL,
    url text,
    filename text NOT NULL,
    location text,
    size integer,
    content_type text,
    sha256 text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_verified timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'active'::text
);


ALTER TABLE transparency.documents OWNER TO postgres;

--
-- Name: TABLE documents; Type: COMMENT; Schema: transparency; Owner: postgres
--

COMMENT ON TABLE transparency.documents IS 'Metadata about scraped documents';


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: transparency; Owner: postgres
--

CREATE SEQUENCE transparency.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transparency.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: transparency; Owner: postgres
--

ALTER SEQUENCE transparency.documents_id_seq OWNED BY transparency.documents.id;


--
-- Name: financial_data; Type: TABLE; Schema: transparency; Owner: postgres
--

CREATE TABLE transparency.financial_data (
    id integer NOT NULL,
    document_id integer,
    year integer,
    amount numeric(15,2),
    concept text,
    category text,
    date_extracted date,
    extraction_method text
);


ALTER TABLE transparency.financial_data OWNER TO postgres;

--
-- Name: TABLE financial_data; Type: COMMENT; Schema: transparency; Owner: postgres
--

COMMENT ON TABLE transparency.financial_data IS 'Extracted financial data';


--
-- Name: financial_data_id_seq; Type: SEQUENCE; Schema: transparency; Owner: postgres
--

CREATE SEQUENCE transparency.financial_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transparency.financial_data_id_seq OWNER TO postgres;

--
-- Name: financial_data_id_seq; Type: SEQUENCE OWNED BY; Schema: transparency; Owner: postgres
--

ALTER SEQUENCE transparency.financial_data_id_seq OWNED BY transparency.financial_data.id;


--
-- Name: processed_files; Type: TABLE; Schema: transparency; Owner: postgres
--

CREATE TABLE transparency.processed_files (
    id integer NOT NULL,
    document_id integer,
    original_filename text NOT NULL,
    processed_filename text NOT NULL,
    processing_type text NOT NULL,
    file_size integer,
    processing_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    success boolean DEFAULT true,
    error_message text
);


ALTER TABLE transparency.processed_files OWNER TO postgres;

--
-- Name: TABLE processed_files; Type: COMMENT; Schema: transparency; Owner: postgres
--

COMMENT ON TABLE transparency.processed_files IS 'Tracks processed files (CSV, TXT, Markdown)';


--
-- Name: processed_files_id_seq; Type: SEQUENCE; Schema: transparency; Owner: postgres
--

CREATE SEQUENCE transparency.processed_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transparency.processed_files_id_seq OWNER TO postgres;

--
-- Name: processed_files_id_seq; Type: SEQUENCE OWNED BY; Schema: transparency; Owner: postgres
--

ALTER SEQUENCE transparency.processed_files_id_seq OWNED BY transparency.processed_files.id;


--
-- Name: budget_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_data ALTER COLUMN id SET DEFAULT nextval('public.budget_data_id_seq'::regclass);


--
-- Name: budget_execution id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_execution ALTER COLUMN id SET DEFAULT nextval('public.budget_execution_id_seq'::regclass);


--
-- Name: contract_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_details ALTER COLUMN id SET DEFAULT nextval('public.contract_details_id_seq'::regclass);


--
-- Name: data_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_sources ALTER COLUMN id SET DEFAULT nextval('public.data_sources_id_seq'::regclass);


--
-- Name: document_content id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_content ALTER COLUMN id SET DEFAULT nextval('public.document_content_id_seq'::regclass);


--
-- Name: document_relationships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_relationships ALTER COLUMN id SET DEFAULT nextval('public.document_relationships_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: extracted_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_data ALTER COLUMN id SET DEFAULT nextval('public.extracted_data_id_seq'::regclass);


--
-- Name: extracted_financial_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_financial_data ALTER COLUMN id SET DEFAULT nextval('public.extracted_financial_data_id_seq'::regclass);


--
-- Name: fee_rights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_rights ALTER COLUMN id SET DEFAULT nextval('public.fee_rights_id_seq'::regclass);


--
-- Name: fees_rights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees_rights ALTER COLUMN id SET DEFAULT nextval('public.fees_rights_id_seq'::regclass);


--
-- Name: financial_indicators id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_indicators ALTER COLUMN id SET DEFAULT nextval('public.financial_indicators_id_seq'::regclass);


--
-- Name: financial_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reports ALTER COLUMN id SET DEFAULT nextval('public.financial_reports_id_seq'::regclass);


--
-- Name: found_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.found_documents ALTER COLUMN id SET DEFAULT nextval('public.found_documents_id_seq'::regclass);


--
-- Name: historical_snapshots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historical_snapshots ALTER COLUMN id SET DEFAULT nextval('public.historical_snapshots_id_seq'::regclass);


--
-- Name: integration_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_log ALTER COLUMN id SET DEFAULT nextval('public.integration_log_id_seq'::regclass);


--
-- Name: investments_assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investments_assets ALTER COLUMN id SET DEFAULT nextval('public.investments_assets_id_seq'::regclass);


--
-- Name: municipal_debt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipal_debt ALTER COLUMN id SET DEFAULT nextval('public.municipal_debt_id_seq'::regclass);


--
-- Name: operational_expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operational_expenses ALTER COLUMN id SET DEFAULT nextval('public.operational_expenses_id_seq'::regclass);


--
-- Name: processed_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_documents ALTER COLUMN id SET DEFAULT nextval('public.processed_documents_id_seq'::regclass);


--
-- Name: processing_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_log ALTER COLUMN id SET DEFAULT nextval('public.processing_log_id_seq'::regclass);


--
-- Name: property_declarations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_declarations ALTER COLUMN id SET DEFAULT nextval('public.property_declarations_id_seq'::regclass);


--
-- Name: public_tenders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_tenders ALTER COLUMN id SET DEFAULT nextval('public.public_tenders_id_seq'::regclass);


--
-- Name: salaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries ALTER COLUMN id SET DEFAULT nextval('public.salaries_id_seq'::regclass);


--
-- Name: salary_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_details ALTER COLUMN id SET DEFAULT nextval('public.salary_details_id_seq'::regclass);


--
-- Name: scraped_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scraped_sources ALTER COLUMN id SET DEFAULT nextval('public.scraped_sources_id_seq'::regclass);


--
-- Name: transparency_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transparency_documents ALTER COLUMN id SET DEFAULT nextval('public.transparency_documents_id_seq'::regclass);


--
-- Name: treasury_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasury_movements ALTER COLUMN id SET DEFAULT nextval('public.treasury_movements_id_seq'::regclass);


--
-- Name: verification_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_audit ALTER COLUMN id SET DEFAULT nextval('public.verification_audit_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.documents ALTER COLUMN id SET DEFAULT nextval('transparency.documents_id_seq'::regclass);


--
-- Name: financial_data id; Type: DEFAULT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.financial_data ALTER COLUMN id SET DEFAULT nextval('transparency.financial_data_id_seq'::regclass);


--
-- Name: processed_files id; Type: DEFAULT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.processed_files ALTER COLUMN id SET DEFAULT nextval('transparency.processed_files_id_seq'::regclass);


--
-- Data for Name: budget_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_data (id, document_id, year, category, subcategory, budgeted_amount, executed_amount, execution_percentage, quarter, extraction_confidence) FROM stdin;
\.


--
-- Data for Name: budget_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_execution (id, document_id, year, quarter, category, budgeted_amount, executed_amount, execution_percentage, variance_amount, department, created_at) FROM stdin;
\.


--
-- Data for Name: contract_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_details (id, document_id, contract_number, title, contractor, amount, contract_date, execution_period, status, category, created_at) FROM stdin;
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_sources (id, source_type, source_name, url, status, last_processed, records_count, processing_notes, created_at) FROM stdin;
1	local	Local File System	file://data/source_materials	registered	\N	0	\N	2025-08-25 11:33:24.857615
3	official	Official Site: https://www.gba.gob.ar/transparencia	https://www.gba.gob.ar/transparencia	registered	\N	0	\N	2025-08-25 11:33:26.311668
4	official	Official Site: https://www.argentina.gob.ar/jefatura/transparencia	https://www.argentina.gob.ar/jefatura/transparencia	registered	\N	0	\N	2025-08-25 11:33:26.313192
5	archive	Web Archive: https://web.archive.org/web/*/https://www.carmensdeareco.gov.ar*	https://web.archive.org/web/*/https://www.carmensdeareco.gov.ar*	registered	\N	0	\N	2025-08-25 11:33:44.058053
6	archive	Web Archive: https://archive.today/search?url=carmensdeareco.gov.ar	https://archive.today/search?url=carmensdeareco.gov.ar	registered	\N	0	\N	2025-08-25 11:33:44.06451
2	official	Official Site: https://carmendeareco.gob.ar/transparencia/	https://carmendeareco.gob.ar/transparencia/	registered	\N	0	\N	2025-08-25 11:33:26.31011
\.


--
-- Data for Name: document_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_content (id, document_id, page_number, content_type, raw_content, structured_data, searchable_text, metadata) FROM stdin;
\.


--
-- Data for Name: document_relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_relationships (id, primary_doc_id, related_doc_id, relationship_type, confidence_score, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, filename, original_path, markdown_path, document_type, category, year, file_size, file_hash, verification_status, official_url, archive_url, extraction_method, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: extracted_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.extracted_data (id, document_id, data_type, table_data, key_values, extracted_at) FROM stdin;
\.


--
-- Data for Name: extracted_financial_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.extracted_financial_data (id, document_id, data_type, category, extracted_text, amounts, dates, entities, metadata, confidence_score, created_at) FROM stdin;
1	28	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias  Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                   \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                   \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                           \n4                                                                                                                  	[]	["31/06/2024"]	["modificatorias  Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:30:47.138891
2	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:30:47.415289
3	170	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00\n3                                                                                                                                                                                                                                                                                                                                                                                                      \n4            	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "Variacion Trimestral", "Valor del Modulo Fiscal Seg Ord"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:30:47.427697
4	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:30:47.585411
5	28	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias  Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                   \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                   \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                           \n4                                                                                                                  	[]	["31/06/2024"]	["modificatorias  Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:30:47.607372
6	229	general_document	Documentos Generales	=== Ord Imp 3202 Actualizada ===\n    Unnamed: 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Unnamed: 1                                                                                                                                                               Unnamed: 2                                                                                                           Unnamed: 3                                                                                        TRIMESTRE                                                 Valor MF Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14      Unnamed: 15 Unnamed: 16\n0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           Para ver valores anteriores selecciona	["100,00"]	[]	["Ord Imp", "TRIMESTRE                                                 Valor MF Unnamed", "Para ver valores anteriores seleccionar trimesre", "consultar                                                                                                                                                                                                       JUL", "TRIMESTRE    VALOR MF", "CONSIDERACIONES GENERALES", "De acuerdo", "lo establecido en la Ordenanza Fiscal", "las Tasas", "demás Tributos previstos en la Parte Especial de ese texto"]	{"sheets": 1, "sheet_names": ["Ord Imp 3202 Actualizada"], "table_count": 1}	\N	2025-08-25 11:30:47.734014
7	230	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                            \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                          PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                            \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                                    \n4                                                                     	[]	["24-09-30"]	["modificatorias           Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                          PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:30:47.755374
8	231	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6  Unnamed: 7 Unnamed: 8  Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                            PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                              \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                                      \n4                                                           	[]	["24-12-31"]	["modificatorias           Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                            PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:30:47.776438
9	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:30:47.891253
10	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:30:47.9093
11	28	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias  Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                   \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                   \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                           \n4                                                                                                                  	[]	["31/06/2024"]	["modificatorias  Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:33:25.008468
12	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:33:25.230304
13	170	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00\n3                                                                                                                                                                                                                                                                                                                                                                                                      \n4            	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "Variacion Trimestral", "Valor del Modulo Fiscal Seg Ord"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:33:25.243337
14	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:33:25.352133
15	28	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias  Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                   \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                   \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                           \n4                                                                                                                  	[]	["31/06/2024"]	["modificatorias  Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                 PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:33:25.372162
16	229	general_document	Documentos Generales	=== Ord Imp 3202 Actualizada ===\n    Unnamed: 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Unnamed: 1                                                                                                                                                               Unnamed: 2                                                                                                           Unnamed: 3                                                                                        TRIMESTRE                                                 Valor MF Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14      Unnamed: 15 Unnamed: 16\n0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           Para ver valores anteriores selecciona	["100,00"]	[]	["Ord Imp", "TRIMESTRE                                                 Valor MF Unnamed", "Para ver valores anteriores seleccionar trimesre", "consultar                                                                                                                                                                                                       JUL", "TRIMESTRE    VALOR MF", "CONSIDERACIONES GENERALES", "De acuerdo", "lo establecido en la Ordenanza Fiscal", "las Tasas", "demás Tributos previstos en la Parte Especial de ese texto"]	{"sheets": 1, "sheet_names": ["Ord Imp 3202 Actualizada"], "table_count": 1}	\N	2025-08-25 11:33:25.494401
17	230	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                            \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                          PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                            \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                                    \n4                                                                     	[]	["24-09-30"]	["modificatorias           Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                          PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:33:25.515349
18	231	debt_report	Información de Deuda	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6  Unnamed: 7 Unnamed: 8  Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                            PLANILLA C\n2                                                                                                                                                                                                                                                                                                                                                                                              \n3                                         STOCK DE DEUDA PÚBLICA Y PERFIL DE VENCIMIENTOS - DEUDA CONTINGENTE - DEUDA FLOTANTE - COMPRA A PLAZO Y LEASING                                                                                                                                                                                                                                      \n4                                                           	[]	["24-12-31"]	["modificatorias           Unnamed", "Municipalidad de CARMEN DE ARECO                                                                                                                                                                                                                            PLANILLA", "STOCK DE DEUDA PÚBLICA", "PERFIL DE VENCIMIENTOS", "DEUDA CONTINGENTE", "DEUDA FLOTANTE", "En pesos", "SALDO AL", "total anual", "ORGANISMO ACREEDOR"]	{"sheets": 1, "sheet_names": ["Planilla C "], "table_count": 1}	\N	2025-08-25 11:33:25.533914
19	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:33:25.623678
20	169	general_document	Documentos Generales	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                                             2do Trimestre 2024                                             3er Trimestre 2024                                             4to Trimestre 2024                                             1er Trimestre 2025                                             2do Trimestre 2025                                          \n2                                  Variacion Trimestral  2023-09-01 00:00:00  2023-10-01 00:00:00  2023-11-01 00:00:00  2023-12-01 00:00:00  2024-01-01 00:00:00  2024-02-01 00:00:00  2024-03-01 00:00:00  2024-04-01 00:00:00  2024-05-01 00:00:00  2024-06-01 00:00:00  2024-07-01 00:00:00  2024-08-01 00:00:00  2024-09-01 00:00:00  2024-10-01 00:00:00  2024-11-01 00:00:00  2024-12-01 00:00:00  2025-01-01 00:00:00  2025-	[]	["23-09-01", "23-10-01", "23-11-01", "23-12-01", "24-01-01", "24-02-01", "24-03-01", "24-04-01", "24-05-01", "24-06-01"]	["Serie Historica MF", "Evolucion Modulo Fiscal            Unnamed", "Según Odenanza Imp", "to Trimestre", "er Trimestre", "do Trimestre", "er Trimestre", "to Trimestre", "er Trimestre", "do Trimestre"]	{"sheets": 1, "sheet_names": ["Serie Historica MF"], "table_count": 1}	\N	2025-08-25 11:33:25.638349
\.


--
-- Data for Name: fee_rights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_rights (id, year, category, description, revenue, collection_efficiency, document_hash, created_at) FROM stdin;
\.


--
-- Data for Name: fees_rights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fees_rights (id, year, category, description, revenue, collection_efficiency) FROM stdin;
1	2024	tasas_municipales	Recaudación por tasas de servicios municipales	75000000.00	89.50
2	2024	derechos_urbanos	Recaudación por derechos de ocupación y uso del espacio público	42000000.00	92.30
\.


--
-- Data for Name: financial_indicators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_indicators (id, year, indicator_name, value, description, comparison_previous_year) FROM stdin;
1	2024	indice_transparencia	8.70	Índice de transparencia municipal (escala 1-10)	12.50
2	2024	solvencia_financiera	1.80	Ratio de solvencia (activos totales / pasivos totales)	5.30
\.


--
-- Data for Name: financial_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_reports (id, year, quarter, report_type, income, expenses, balance, execution_percentage) FROM stdin;
1	2024	1	budget_execution	425000000.00	380000000.00	45000000.00	92.50
2	2024	2	budget_execution	450000000.00	410000000.00	40000000.00	94.20
\.


--
-- Data for Name: found_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.found_documents (id, source_id, url, title, document_type, estimated_year, file_size, download_status, content_hash, local_path, created_at) FROM stdin;
1	2	https://www.argentina.gob.ar/sites/default/files/revista_cppf_v2.pdf	En Buena LeyLa revista digital del Ministerio de Justicia.	general	\N	\N	pending	\N	\N	2025-08-25 11:32:44.353946
2	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:48.835371
3	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:57.825204
4	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:58.330192
5	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:58.759779
6	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:59.254974
7	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:32:59.684737
8	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:00.163168
9	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:00.587212
10	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:01.016151
11	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:01.502506
12	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:01.942176
13	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:02.419199
14	2	https://www.argentina.gob.ar/sites/default/files/revista_cppf_v2.pdf	En Buena LeyLa revista digital del Ministerio de Justicia.	general	\N	\N	pending	\N	\N	2025-08-25 11:33:28.368301
15	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:31.774593
16	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:32.213381
17	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:32.648899
18	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:34.427764
19	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:34.878554
20	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:35.392163
21	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:35.81603
22	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:36.313457
23	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:36.784788
24	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:37.237338
25	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:37.748278
26	3	https://www.argentina.gob.ar/sites/default/files/aaip_2025_06_organigrama.pdf	Organigrama	general	2025	\N	pending	\N	\N	2025-08-25 11:33:38.269142
\.


--
-- Data for Name: historical_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historical_snapshots (id, original_url, archive_url, snapshot_date, archive_service, content_hash, status, documents_found, processed, created_at) FROM stdin;
\.


--
-- Data for Name: integration_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_log (id, process_type, source_id, status, records_processed, errors_count, processing_time, details, created_at) FROM stdin;
1	local_processing	1	completed	571	0	1	{"errors": [], "data_extracted": 571, "pdfs_processed": 561, "files_processed": 571, "database_records": 571, "excels_processed": 10}	2025-08-25 11:33:26.308256
\.


--
-- Data for Name: investments_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.investments_assets (id, year, asset_type, description, value, depreciation, location) FROM stdin;
1	2024	inmueble	Edificio municipal sede	120000000.00	24000000.00	Av. Mitre 123, Carmen de Areco
2	2024	maquinaria	Equipamiento vial y herramientas	45000000.00	9000000.00	Depósito municipal
\.


--
-- Data for Name: municipal_debt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.municipal_debt (id, year, debt_type, description, amount, interest_rate, due_date, status) FROM stdin;
1	2024	prestamo_banco	Préstamo para financiamiento de obras públicas	50000000.00	8.50	2029-06-30 00:00:00+00	active
2	2024	anticipo_tesoreria	Anticipo de tesorería para cobertura de gastos operativos	15000000.00	12.00	2024-12-31 00:00:00+00	active
\.


--
-- Data for Name: operational_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operational_expenses (id, year, category, description, amount, administrative_analysis) FROM stdin;
1	2024	sueldos_personal	Remuneraciones al personal municipal	280000000.00	Dentro del presupuesto aprobado
2	2024	mantenimiento_infraestructura	Mantenimiento de edificios y espacios públicos	65000000.00	Eficiente distribución de recursos
\.


--
-- Data for Name: processed_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.processed_documents (id, filename, year, file_type, size_bytes, sha256_hash, document_type, category, priority, keywords, official_url, archive_url, processing_date, created_at) FROM stdin;
1	Acta_de_Apertura_FEAsaU6.pdf	2017	.pdf	40418	960b15aa2880ac9111ebf67fafc0d671378626a0017c9abc7017e33565e988cd	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Acta_de_Apertura_FEAsaU6.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Acta_de_Apertura_FEAsaU6.pdf	2025-08-25 19:53:04.735534	2025-08-26 03:09:32.918535
2	RS-2017-03840811-GDEBA.pdf	2017	.pdf	110518	b0067a8617c37514a39066815c5db4f3338a1a42d18166ef8169d3609914a292	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/RS-2017-03840811-GDEBA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/RS-2017-03840811-GDEBA.pdf	2025-08-25 19:53:04.735838	2025-08-26 03:09:32.918535
3	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 206_2018 del Organismo de Control de la Energía Eléctrica.pdf	2018	.pdf	895552	6d4d67c55622e8280c0036b3ea9257498713b3c77c9f5e3898ef3a984abd60a1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 206_2018 del Organismo de Control de la Energía Eléctrica.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 206_2018 del Organismo de Control de la Energía Eléctrica.pdf	2025-08-25 19:53:04.737607	2025-08-26 03:09:32.918535
4	Resolución 210_2018.pdf	2018	.pdf	116936	8741299ac5d54cc0bbdca06e763d9295e4c9a86b18dbfe321b0d176287f09300	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 210_2018.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 210_2018.pdf	2025-08-25 19:53:04.73839	2025-08-26 03:09:32.918535
5	.DS_Store	2018		6148	18a3295f0771e21c48355d75012d810ba40da4dcc0135eff94b6efc25ca63300	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/.DS_Store	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/.DS_Store	2025-08-25 19:53:04.738655	2025-08-26 03:09:32.918535
6	Resolución 206_2018.pdf	2018	.pdf	118435	917af98d82d9823539c7a6ac25d45e5db7bca5d5ffae9f3b38574bb12c415a91	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 206_2018.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 206_2018.pdf	2025-08-25 19:53:04.738906	2025-08-26 03:09:32.918535
7	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 210_2018 del Organismo de Control de la Energía Eléctrica.pdf	2018	.pdf	894125	fe4590ed39c9aa13e53cad629af8a43f837223d2ab56147b0ae60898c13e1009	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 210_2018 del Organismo de Control de la Energía Eléctrica.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 210_2018 del Organismo de Control de la Energía Eléctrica.pdf	2025-08-25 19:53:04.740333	2025-08-26 03:09:32.918535
8	Contrato_CGZzWR1.pdf	2018	.pdf	252764	932f98cbefc8df9d4068016d7658f32af37e075b08ce5a7feeb4fe9336276de7	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/Contrato_CGZzWR1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Contrato_CGZzWR1.pdf	2025-08-25 19:53:04.740758	2025-08-26 03:09:32.918535
9	Acto_de_Adjudicacion_QmqNYiE.pdf	2018	.pdf	113410	9a1bbb85ca7d44235d9a3df9c961b3d47af48f047e30cc2d3ce635e0cf3a69c3	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Acto_de_Adjudicacion_QmqNYiE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Acto_de_Adjudicacion_QmqNYiE.pdf	2025-08-25 19:53:04.74102	2025-08-26 03:09:32.918535
10	2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf	2019	.pdf	1135686	09b42880fbf7707c1fb19ccf41aa284609f569788f746647f6a888582c6e1b09	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf	2025-08-25 19:53:04.74299	2025-08-26 03:09:32.918535
11	Informe Económico 2019 _ Carmen de Areco - Municipio2.pdf	2019	.pdf	3935334	bf889813cb94ea931df8fad5f72b53184c208833b4117214c8fd1ab82187deb9	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Informe Económico 2019 _ Carmen de Areco - Municipio2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Informe Económico 2019 _ Carmen de Areco - Municipio2.pdf	2025-08-25 19:53:04.746678	2025-08-26 03:09:32.918535
12	Informe Económico 2019 _ Carmen de Areco - Municipio.pdf	2019	.pdf	4278204	1f1217a6535de9240fb849d744b87eee0a11c149c6180c4e34131b1f3e9890ac	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Informe Económico 2019 _ Carmen de Areco - Municipio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Informe Económico 2019 _ Carmen de Areco - Municipio.pdf	2025-08-25 19:53:04.75052	2025-08-26 03:09:32.918535
13	.DS_Store	2020		6148	d65165279105ca6773180500688df4bdc69a2c7b771752f0a46ef120b7fd8ec3	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/.DS_Store	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/.DS_Store	2025-08-25 19:53:04.750957	2025-08-26 03:09:32.918535
14	GANADERIA 2016-2020.pdf	2020	.pdf	546208	403d443a2fc17f9134f9d072bbc6719a552b53116ac5bb1660448acdf6d135bb	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/GANADERIA 2016-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/GANADERIA 2016-2020.pdf	2025-08-25 19:53:04.752491	2025-08-26 03:09:32.918535
15	Resolución 1089_2020.pdf	2020	.pdf	12619465	9fce74ac053d2e3062df8812649a8eca90a76e39158c3534c6202418775909c7	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1089_2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1089_2020.pdf	2025-08-25 19:53:04.761176	2025-08-26 03:09:32.918535
16	EJECUCION-DE-RECURSOS-PERIODO-2020.pdf	2020	.pdf	347152	fbd2126dc38e4515c6991d5b057c0f8f04302a53e0bf0139fcf720c6a1b3bc97	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/EJECUCION-DE-RECURSOS-PERIODO-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/EJECUCION-DE-RECURSOS-PERIODO-2020.pdf	2025-08-25 19:53:04.762413	2025-08-26 03:09:32.918535
17	CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-2020.pdf	2020	.pdf	361931	1ff510ce12ffe1350e5572a662502c3fdfe35ed2a9fee0a5c3552ad22911c64f	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-2020.pdf	2025-08-25 19:53:04.76339	2025-08-26 03:09:32.918535
18	INFORME-ECONÓMICO-FINANCIERO-2020.pdf	2020	.pdf	1440758	cee6b036047f369f19ab4c73ed55bd9a482f09f1833b4d2dfee6fbf25b872f66	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/INFORME-ECONÓMICO-FINANCIERO-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/INFORME-ECONÓMICO-FINANCIERO-2020.pdf	2025-08-25 19:53:04.765588	2025-08-26 03:09:32.918535
19	SITUACION-ECONOMICA-FINANCIERA.pdf	2020	.pdf	71806	12c15f3752c5adaae566b63ab5445425961323386899bee3d6cc6399abf89ff4	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA.pdf	2025-08-25 19:53:04.766337	2025-08-26 03:09:32.918535
20	SITUACIÓN-ECONÓMICO-FINANCIERA.pdf	2020	.pdf	988198	121cf242ca8b1e634f9e6ae8938eb5c2f56f34c1eccad95af7f9fae1824fa188	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACIÓN-ECONÓMICO-FINANCIERA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACIÓN-ECONÓMICO-FINANCIERA.pdf	2025-08-25 19:53:04.768056	2025-08-26 03:09:32.918535
21	SITUACION-ECONOMICA-FINANCIERA-4°TRE-2022.pdf	2020	.pdf	88878	d8bfffdd6c9c62b59142839b09aba07e0782b3e00aaeb8b7c3628033e9d5e72a	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-4°TRE-2022.pdf	2025-08-25 19:53:04.768427	2025-08-26 03:09:32.918535
22	situacion-economica032.pdf	2020	.pdf	651130	2ed308c06f1eff521803e6a59bf946b73df6ab66a63dde5c9d82e50f0de1f1af	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/situacion-economica032.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/situacion-economica032.pdf	2025-08-25 19:53:04.769784	2025-08-26 03:09:32.918535
23	EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf	2020	.pdf	383011	2c7bfb00e01916cc1436a9b2452c8300eef89c29fea41510d754f2e5c5b7c736	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf	2025-08-25 19:53:04.770715	2025-08-26 03:09:32.918535
24	03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2020.xlsx	2020	.xlsx	20586	16248864f54bbc9092b099a91a1bc2bd91927dd865740a254044bbb6a0b001ed	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2020.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2020.xlsx	2025-08-25 19:53:04.771092	2025-08-26 03:09:32.918535
25	SITUACION-PATRIMONIAL-2020.pdf	2020	.pdf	191596	0e70e2cee2135aec49a8149facad37618a3201375a6f35183ffdb0cf6b27bc12	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-PATRIMONIAL-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-PATRIMONIAL-2020.pdf	2025-08-25 19:53:04.771673	2025-08-26 03:09:32.918535
26	SITUACION-ECONOMICA-FINANCIERA-3°TRIMESTRE.pdf	2020	.pdf	72452	6a2785885a928f0eb585c365b449f9508d124b3fc883e01ac99d311015e40d53	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-3°TRIMESTRE.pdf	2025-08-25 19:53:04.772152	2025-08-26 03:09:32.918535
27	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1089_2020 del MINISTERIO DE INFRAESTRUCTURA Y SERVICIOS PÚBLICOS.pdf	2020	.pdf	964795	d3dd27b87a3b425f6b1bf48f63f62818111e8f40ef66912ca71a62eeb9a2573e	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1089_2020 del MINISTERIO DE INFRAESTRUCTURA Y SERVICIOS PÚBLICOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1089_2020 del MINISTERIO DE INFRAESTRUCTURA Y SERVICIOS PÚBLICOS.pdf	2025-08-25 19:53:04.773704	2025-08-26 03:09:32.918535
28	BALANCE-GENERAL-2020.pdf	2020	.pdf	395513	3b00ef7077e5c2df10b6934cd1838ed308bfbcf541982144573bf89ed9affb64	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/BALANCE-GENERAL-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/BALANCE-GENERAL-2020.pdf	2025-08-25 19:53:04.774528	2025-08-26 03:09:32.918535
29	SITUACION-ECONOMICA-FINANCIERA-3°TRI-2022.pdf	2020	.pdf	72061	ac0caf6772fc436603311ab54f2907cf19d6bdaaa9916ae73475a295b8ba048c	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-3°TRI-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-3°TRI-2022.pdf	2025-08-25 19:53:04.774766	2025-08-26 03:09:32.918535
30	SITUACION-ECONOMICO-FINANCIERA-2020.pdf	2020	.pdf	220602	7dc9f9da4ab2a7add95e0f33b0b1bf2ae1aa48116a483806c593bdcdf8d87ec9	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICO-FINANCIERA-2020.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICO-FINANCIERA-2020.pdf	2025-08-25 19:53:04.775125	2025-08-26 03:09:32.918535
31	SALUD-CAP-2021-CARMEN-DE-ARECO.pdf	2021	.pdf	434396	10e6db8aee4ae854404ffa012ea21806c70e42d95ef2396115fa66a48f9b5beb	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SALUD-CAP-2021-CARMEN-DE-ARECO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SALUD-CAP-2021-CARMEN-DE-ARECO.pdf	2025-08-25 19:53:04.776569	2025-08-26 03:09:32.918535
32	2021%20SERVICIOS%20PUBLICOS.pdf	2021	.pdf	651610	9d116a63c305a75fd754a0fa8e132a80a360254f5c9c9ce66b10aabb97dea733	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20SERVICIOS%20PUBLICOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20SERVICIOS%20PUBLICOS.pdf	2025-08-25 19:53:04.777831	2025-08-26 03:09:32.918535
33	Resolución 1838_2021.pdf	2021	.pdf	108917	451d01791917bbf8cad09839ca371335df72e6e1e52611714810614709f605a9	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1838_2021.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1838_2021.pdf	2025-08-25 19:53:04.778567	2025-08-26 03:09:32.918535
34	2021%20CAPS%20ESTADISTICAS.pdf	2021	.pdf	508568	2ec86694b6cfff4ce155c158f2b761581c83e3b6d5e78dbd14fd9b2ddc4ad8d5	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20CAPS%20ESTADISTICAS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20CAPS%20ESTADISTICAS.pdf	2025-08-25 19:53:04.779796	2025-08-26 03:09:32.918535
36	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1838_2021 del Ministerio de Desarrollo de la Comunidad.pdf	2021	.pdf	952468	e8ce6460af41fb6b1aa915869c872d9aa9a2d46864536a3f99a45e5df5ac1bfc	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1838_2021 del Ministerio de Desarrollo de la Comunidad.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1838_2021 del Ministerio de Desarrollo de la Comunidad.pdf	2025-08-25 19:53:04.781724	2025-08-26 03:09:32.918535
37	2021%20HABILITACIONES%20MUNICIPALES.pdf	2021	.pdf	524846	5e6ac7e2a59b951c78f93cf1af23697a485c5a2c8eee5550a49dfa624aa8f8aa	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20HABILITACIONES%20MUNICIPALES.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20HABILITACIONES%20MUNICIPALES.pdf	2025-08-25 19:53:04.782787	2025-08-26 03:09:32.918535
74	REPORTES CIUDADANOS 2022.pdf	2022	.pdf	491568	1f10662384326e6d69750dcbcedf6c1ea5c7f66dcd7f9517df56aa5230bbb359	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/REPORTES CIUDADANOS 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/REPORTES CIUDADANOS 2022.pdf	2025-08-25 19:53:04.817337	2025-08-26 03:09:32.918535
38	Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 265_2021 de la Dirección de Fiscalización Vegetal del Ministerio de Desarrollo Agrario.pdf	2021	.pdf	926838	e7eea4db8ab0c33fded4a869303accb07792c3ba4d8b53cfff1a583c9ae7f108	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 265_2021 de la Dirección de Fiscalización Vegetal del Ministerio de Desarrollo Agrario.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 265_2021 de la Dirección de Fiscalización Vegetal del Ministerio de Desarrollo Agrario.pdf	2025-08-25 19:53:04.784626	2025-08-26 03:09:32.918535
39	2021%20ESTADISTICAS%20OMIC.pdf	2021	.pdf	800550	062d0991004ba3302c19e1e366955df44a8e79cf721bf981c08455d8071a0471	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20ESTADISTICAS%20OMIC.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20ESTADISTICAS%20OMIC.pdf	2025-08-25 19:53:04.786097	2025-08-26 03:09:32.918535
40	COSECHA 2012-2021.pdf	2021	.pdf	607800	a5a64d7cf83271b3bc2e35f2bae8fba21fe1b3db61a10b6779b4846ff76bd2a5	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/COSECHA 2012-2021.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/COSECHA 2012-2021.pdf	2025-08-25 19:53:04.787391	2025-08-26 03:09:32.918535
41	ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	2021	.pdf	115864	9184981528eaf7b5a7f90ddc786d9accf7ca755ec0b7222cf5b75503e5b3ea6d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	2025-08-25 19:53:04.787942	2025-08-26 03:09:32.918535
42	Disposición 265_2021.pdf	2021	.pdf	102719	d9fdd7b0e44ce85b094364a38c1b1d3a7d6efa7cd6557dc281276f6e51648a8b	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Disposición 265_2021.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Disposición 265_2021.pdf	2025-08-25 19:53:04.788173	2025-08-26 03:09:32.918535
43	2021%20ADMINISTRACION%20DE%20PERSONAL.pdf	2021	.pdf	648650	5b55b66696a6d6ee601dcc2622db9acf3f0b54d7aa75827ae361190d7f0bd802	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20ADMINISTRACION%20DE%20PERSONAL.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20ADMINISTRACION%20DE%20PERSONAL.pdf	2025-08-25 19:53:04.789433	2025-08-26 03:09:32.918535
44	2021%20SEGURIDAD%20URBANA.pdf	2021	.pdf	577183	0e2b006c1dc65b37157db3969285fef4325da9f439af7371aec9e06cf38af2be	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20SEGURIDAD%20URBANA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20SEGURIDAD%20URBANA.pdf	2025-08-25 19:53:04.790565	2025-08-26 03:09:32.918535
45	2021%20REPORTES%20DE%20CIUDADANOS.pdf	2021	.pdf	565999	cabd20aa79b89d86232624254d4d6074feb29f3b3c1882262b668e1a4066e124	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20REPORTES%20DE%20CIUDADANOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20REPORTES%20DE%20CIUDADANOS.pdf	2025-08-25 19:53:04.791443	2025-08-26 03:09:32.918535
46	2021%20ESTADISTICAS%20MONITOREO.pdf	2021	.pdf	530385	c155afa123e06908002afb9389163f7ee9853bf010f5f63197909933afc2c23d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20ESTADISTICAS%20MONITOREO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20ESTADISTICAS%20MONITOREO.pdf	2025-08-25 19:53:04.792477	2025-08-26 03:09:32.918535
47	PRODUCCION 2012-2021.pdf	2021	.pdf	603445	c2d5d451edcc9b9b8489dfe4ca9dda865a3079d169740b996896404f6b357a5f	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/PRODUCCION 2012-2021.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/PRODUCCION 2012-2021.pdf	2025-08-25 19:53:04.793851	2025-08-26 03:09:32.918535
48	SIEMBRA 2012-2021.pdf	2021	.pdf	606033	2ac4b852215574ed554b523d4f32ea781772aac05a119e35d2a1acc2ba9692c6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SIEMBRA 2012-2021.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SIEMBRA 2012-2021.pdf	2025-08-25 19:53:04.795167	2025-08-26 03:09:32.918535
49	2021%20BASE%20DE%20DATOS%20NIÑEZ%20Y%20ADOLESCENCIA.pdf	2021	.pdf	525690	ed0334d6deedc783aaab543433d258d2e31afe9be01dd25985e1ff48131c5cd1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20BASE%20DE%20DATOS%20NIÑEZ%20Y%20ADOLESCENCIA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20BASE%20DE%20DATOS%20NIÑEZ%20Y%20ADOLESCENCIA.pdf	2025-08-25 19:53:04.796393	2025-08-26 03:09:32.918535
50	2021%20INDICES%20DE%20EDUCACION.pdf	2021	.pdf	566161	ead9d3efb9ac39042e2311282a17fd2f5dde6a01c5bf9d13d9f5bdb375b580bd	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/2021%20INDICES%20DE%20EDUCACION.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/2021%20INDICES%20DE%20EDUCACION.pdf	2025-08-25 19:53:04.797547	2025-08-26 03:09:32.918535
51	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf	2022	.pdf	959558	d3871f62ebb077fc69a9bb1a186ed818f6fa40423e694fa5cee3c41c0ea5394e	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf	2025-08-25 19:53:04.799144	2025-08-26 03:09:32.918535
52	Resolución 79_2022.pdf	2022	.pdf	109114	d9017c1330bd1b3e7f4dde5211a6e64cc9f4716c6da76f34f5a910169004b44d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 79_2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 79_2022.pdf	2025-08-25 19:53:04.799719	2025-08-26 03:09:32.918535
53	SERVICIOS PUBLICOS 2022.pdf	2022	.pdf	650179	2081dbacfcfcefaa5ce8e0db05fb6842da7fcaeec063a51a79177c8b85ef8e84	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SERVICIOS PUBLICOS 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SERVICIOS PUBLICOS 2022.pdf	2025-08-25 19:53:04.800769	2025-08-26 03:09:32.918535
54	ESTADO-DE-EJECUCION-DE-GASTOS-1.pdf	2022	.pdf	1141711	c96410bfe1d487c5a1adf85d05d5c5af26d5ff0ec3a520abe2ee3de8661aba3b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-1.pdf	2025-08-25 19:53:04.8022	2025-08-26 03:09:32.918535
75	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	2022	.pdf	67548	4306f1e488451b31f7ac5ba558f7a57b2cd9eca3574565da7cd29e37fb308eea	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	2025-08-25 19:53:04.817954	2025-08-26 03:09:32.918535
55	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf	2022	.pdf	957949	ec96fbaf02d8dc368ada5a3139436c1960e1366f3dd0121a29175895f97f2491	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf	2025-08-25 19:53:04.803761	2025-08-26 03:09:32.918535
56	Resolución 1146_2022.pdf	2022	.pdf	121789	9210f527b0c3b635b0b4a719aae3f29cf6aaea359d1163a7e1cf7d923f610793	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1146_2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1146_2022.pdf	2025-08-25 19:53:04.804693	2025-08-26 03:09:32.918535
57	ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf	2022	.pdf	86333	ae54edfbcd1d15475e157fbbb692f7e604f97cb93db9a699769927d1276c941f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf	2025-08-25 19:53:04.805309	2025-08-26 03:09:32.918535
59	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf	2022	.pdf	119210	4a083772815e88766d34b06e2bb681cee0def5f6489325237964f5406b50b5dd	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf	2025-08-25 19:53:04.806217	2025-08-26 03:09:32.918535
60	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	2022	.pdf	109553	f0a524f4c7136cfd1b1259b5588a93b1c3f5639b1f7f20552ec125b2d755e8ad	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	2025-08-25 19:53:04.806803	2025-08-26 03:09:32.918535
61	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf	2022	.pdf	101639	75d3b177a2d81d121848a0d0179220eda740948f9df8790960b19037712e0ce2	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf	2025-08-25 19:53:04.807062	2025-08-26 03:09:32.918535
62	NOTAS MONITOREO 2022.pdf	2022	.pdf	753027	9b6adfbdba81b54507f17aadaeaa20480084fcff12cfc2fdeb1d0b04f36cdd40	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/NOTAS MONITOREO 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/NOTAS MONITOREO 2022.pdf	2025-08-25 19:53:04.808271	2025-08-26 03:09:32.918535
63	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf	2022	.pdf	1020228	528fbd794a3501258533eb1ec5b8c5507ad46113c55658db29df2c4753bdc6a8	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf	2025-08-25 19:53:04.810075	2025-08-26 03:09:32.918535
64	Resolución 1593_2022.pdf	2022	.pdf	114309	9dfa4eedd97cebce4a43518f226b6aae4ea880537d6fdb3bfdcc1b9c5893d8a0	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1593_2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1593_2022.pdf	2025-08-25 19:53:04.810715	2025-08-26 03:09:32.918535
65	ESTADO-DE-EJECUCION-DE-RECURSOS.pdf	2022	.pdf	151544	1fdbe0cea50eaf6e9be1db520f63d5b8572573dea8dce55e25966902515bb958	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS.pdf	2025-08-25 19:53:04.811352	2025-08-26 03:09:32.918535
66	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-1.pdf	2022	.pdf	66180	338d773bec757011ebdeeee0a9d987cf14275d21857ff23258d64f54d2f1233b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-1.pdf	2025-08-25 19:53:04.811846	2025-08-26 03:09:32.918535
67	CAIF-1.pdf	2022	.pdf	93387	6735bd3efa3db040d9784e40b9d4468dd4429448a0c5a1629555ffd131343ec2	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-1.pdf	2025-08-25 19:53:04.812404	2025-08-26 03:09:32.918535
68	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf	2022	.pdf	109812	465dae3e768f713c360ed1857ea1f97b9c74d78dc32ad7ce8b603f7dbffc2432	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf	2025-08-25 19:53:04.812879	2025-08-26 03:09:32.918535
69	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf	2022	.pdf	101071	ee8a3c2aab89ba62d573850e6f715dbe8b5ee37aae7d426c7ce7a4acfc21286f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf	2025-08-25 19:53:04.813106	2025-08-26 03:09:32.918535
70	MONITOREO 2022.pdf	2022	.pdf	665737	5e6edfcfe57f81f9e55ed90cbdd8724373d172f2b7d35d20ee472c746d0dccde	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/MONITOREO 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/MONITOREO 2022.pdf	2025-08-25 19:53:04.814208	2025-08-26 03:09:32.918535
71	CAIF-2.pdf	2022	.pdf	93906	d380dbf7efdb9a5a4588b5219f8e1d406e7c071fc065291e6082430d932a9222	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-2.pdf	2025-08-25 19:53:04.814404	2025-08-26 03:09:32.918535
73	SEGURIDAD URBANA 2022.pdf	2022	.pdf	711439	3458f211f4f3b1e2407b974d11ea73b961665030bfe2fbf6804eeec31e7482e3	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SEGURIDAD URBANA 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SEGURIDAD URBANA 2022.pdf	2025-08-25 19:53:04.816349	2025-08-26 03:09:32.918535
76	CAIF-3°TRI-2022.pdf	2022	.pdf	94144	b2f1065cd808e3c5f182c4e73b5d4c8d30f33db65ff87da4df8ed6af911688f6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-3°TRI-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-3°TRI-2022.pdf	2025-08-25 19:53:04.818574	2025-08-26 03:09:32.918535
77	ESTADO-DE-EJECUCION-DE-GASTOS-4°TRE-2022.pdf	2022	.pdf	1299495	0cc6ea42fda7e0c6041a038039d5e1bdb84985d403becb64e5c6fcdf7d12ec20	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-4°TRE-2022.pdf	2025-08-25 19:53:04.820299	2025-08-26 03:09:32.918535
78	ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf	2022	.pdf	606072	279215aea1f65e9adb380dbbf1734b5179174793616f77bd9fd8bae47b5d6011	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf	2025-08-25 19:53:04.821601	2025-08-26 03:09:32.918535
79	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf	2022	.pdf	85022	4afedf8d7291e59f7742bef43e9aacd1dd0b576f7e87433692a27cebcb45eb64	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf	2025-08-25 19:53:04.82217	2025-08-26 03:09:32.918535
81	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf	2022	.pdf	924921	d9b36f698de47088acceabc761fdb22cf53b53e2e9623d857f983716ac0406e1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf	2025-08-25 19:53:04.824196	2025-08-26 03:09:32.918535
82	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-1.pdf	2022	.pdf	118244	787feaa0bb2b433eb2af8f63287ed3216a4803ff880a01ffd9cffe55e51cacb3	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-1.pdf	2025-08-25 19:53:04.825035	2025-08-26 03:09:32.918535
83	Resolución 747_2022.pdf	2022	.pdf	111960	689ca7f746c4ba31929f2d8ac087b31efd42984a9706b53cd80924b82b1ba746	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 747_2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 747_2022.pdf	2025-08-25 19:53:04.825606	2025-08-26 03:09:32.918535
84	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA.pdf	2022	.pdf	85712	f201f0fd100485241cf4933c842bdd0ee5bd010b07269ffd08adc3d29dd26769	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA.pdf	2025-08-25 19:53:04.826181	2025-08-26 03:09:32.918535
85	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf	2022	.pdf	85431	4f9f36eb2fa279a17e70f5ce1758fe0ffa5eba1b3e46b1e0d096becf6d44c6a6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf	2025-08-25 19:53:04.826701	2025-08-26 03:09:32.918535
86	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf	2022	.pdf	922577	2562daf72188e99d71d772724554149503fb8455827b8b55d9101461e6e1bed7	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf	2025-08-25 19:53:04.828284	2025-08-26 03:09:32.918535
87	SITUACION-ECONOMICA-FINANCIERA-1.pdf	2022	.pdf	72005	d53d9da0a37c71f6172da64f9916d937791985b50ecb99c1596e61e0f53f2c2a	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-1.pdf	2025-08-25 19:53:04.829009	2025-08-26 03:09:32.918535
88	ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRI-2022.pdf	2022	.pdf	85366	ab419cf2f9b6fe30ff65392bb507d7cfb06d011a4f3fb09ea2db4bccd89134a6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRI-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRI-2022.pdf	2025-08-25 19:53:04.829561	2025-08-26 03:09:32.918535
89	ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRI-2022.pdf	2022	.pdf	102876	8d6f28cf74b7e254ec84956826a51851b18292014d6a3f95a4c5007dddf509cd	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRI-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRI-2022.pdf	2025-08-25 19:53:04.829793	2025-08-26 03:09:32.918535
90	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	2022	.pdf	102105	52df63981063e70a4f4f90e8b7fa6c27c9ddf5ba74d32e3e1629dd6c6d5c7794	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	2025-08-25 19:53:04.830567	2025-08-26 03:09:32.918535
91	ESTADO-DE-EJECUCION-DE-GASTOS.pdf	2022	.pdf	1173473	2c484fe3d6da30036b0bc2f57be03943a38cea6a8cf9b4e783aca3e0341f2962	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS.pdf	2025-08-25 19:53:04.832344	2025-08-26 03:09:32.918535
92	ESTADO-DE-EJECUCION-DE-RECURSOS-1.pdf	2022	.pdf	141931	37b9eaddabafb660035df5a322a84523cda4f5d34f60a3ff6fa7d4363e199b6b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-1.pdf	2025-08-25 19:53:04.833113	2025-08-26 03:09:32.918535
93	ESTADOS-DE-EJECUCION-DE-RECURSOS-3°TRI-2022 copy.pdf	2022	.pdf	142229	c401cfabe62f7406b74d761f36122ff31dbda494e474f4f87b66427d44712c14	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-3°TRI-2022 copy.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADOS-DE-EJECUCION-DE-RECURSOS-3°TRI-2022 copy.pdf	2025-08-25 19:53:04.833865	2025-08-26 03:09:32.918535
94	ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf	2022	.pdf	147280	8bf8fc908041f32b11fb7ed8732ecd5083042b9c30229de81b6f90b39cba5a26	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf	2025-08-25 19:53:04.834195	2025-08-26 03:09:32.918535
95	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-4°TRE-2022.pdf	2022	.pdf	67723	5543a0b6883b62e2d8ee6250e6caa93a33644da29a19a8f705dd718d4cf959f0	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-4°TRE-2022.pdf	2025-08-25 19:53:04.834433	2025-08-26 03:09:32.918535
96	HABILITACIONES MUNICIPALES 2022.pdf	2022	.pdf	548917	0d367d31fdd9a0574bb712819b5d8a631df7e2a189fada505c2b6c68a0a30602	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/HABILITACIONES MUNICIPALES 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/HABILITACIONES MUNICIPALES 2022.pdf	2025-08-25 19:53:04.835383	2025-08-26 03:09:32.918535
97	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	2022	.pdf	102506	7204f82ac99b0cbc94d6f6d3181968b9f06c96c9d2ce56f4077d906d1d71c01b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	2025-08-25 19:53:04.836024	2025-08-26 03:09:32.918535
99	ESTADO-DE-EJECUCION-DE-GASTOS-3°TRI-2022.pdf	2022	.pdf	1157656	369b875462e5b7903925b02d4f09898e52b5a65b07a31bc4d663d5286466a450	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRI-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRI-2022.pdf	2025-08-25 19:53:04.838242	2025-08-26 03:09:32.918535
100	CAIF-4°TRE-2022.pdf	2022	.pdf	93600	9bba3d1a9d402a22e85e028162d09e5f846e8a7201c4ea5a8eb9fd0a3922ce5c	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-4°TRE-2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-4°TRE-2022.pdf	2025-08-25 19:53:04.838845	2025-08-26 03:09:32.918535
101	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO.pdf	2022	.pdf	109662	a841f43fbcd9b851ee884dedfd2e9381bb4166c4dea34a30b1f3d5e2cf14e624	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO.pdf	2025-08-25 19:53:04.83945	2025-08-26 03:09:32.918535
102	OMIC 2022.pdf	2022	.pdf	606304	7f43580c7cf5c71baf063f56b12b84d3b2c51577b0b3d40bc868984425c64986	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/OMIC 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/OMIC 2022.pdf	2025-08-25 19:53:04.840809	2025-08-26 03:09:32.918535
103	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	2022	.pdf	121409	b587c3d0c2d04c7d629795390b7e350438639686d9c63d05e3d44337a7efafe6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	2025-08-25 19:53:04.841422	2025-08-26 03:09:32.918535
104	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-1.pdf	2022	.pdf	102839	8ba792ed7ac608e72188d3c9d9d8279636f1d6be6b255212fcf241c4809a4a49	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-1.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-1.pdf	2025-08-25 19:53:04.841645	2025-08-26 03:09:32.918535
106	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO.pdf	2022	.pdf	102664	308daa7e179baedd867e9fd32cc73d3695082b17b4019e0280f363e3a7a0ac76	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO.pdf	2025-08-25 19:53:04.842854	2025-08-26 03:09:32.918535
107	ESTADISTICAS CAPS 2022.pdf	2022	.pdf	709359	8e13b9f3cc8367ad7ce10d26f03cf231eef79fcb368b735e00fff102d220b6c7	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ESTADISTICAS CAPS 2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADISTICAS CAPS 2022.pdf	2025-08-25 19:53:04.844183	2025-08-26 03:09:32.918535
108	Resolución 1279_2022.pdf	2022	.pdf	113348	0dc41aaa44903107d162f6858f8ed992e8defd1f69fae5572923ebe1219e4484	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1279_2022.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1279_2022.pdf	2025-08-25 19:53:04.844803	2025-08-26 03:09:32.918535
109	LICITACION-PUBLICA-N°11.pdf	2023	.pdf	769278	551ae71a8be9e2903b5988db85ab273f80955ad0bae57613759ea2076085efdd	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°11.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°11.pdf	2025-08-25 19:53:04.846371	2025-08-26 03:09:32.918535
110	ESTADO-DE-EJECUCION-DE-GASTOS-2.pdf	2023	.pdf	1172209	768a6e2c33e6632c7fc156cf975bb86dc1480c5bcc28381ab8c56290cedbed66	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-2.pdf	2025-08-25 19:53:04.848151	2025-08-26 03:09:32.918535
111	LICITACION-PUBLICA-N°10.pdf	2023	.pdf	722391	9e3a6c534f421d24ca521a122e99b139fab7e1be7801dc2ae0367541ad9236ab	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°10.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°10.pdf	2025-08-25 19:53:04.849318	2025-08-26 03:09:32.918535
112	MODULO-FISCAL.xlsx	2023	.xlsx	15576	f6ef7552ff59c458b4f707fb5390ea86cf91376f549a6d7f692c4c556e4fde14	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/MODULO-FISCAL.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/MODULO-FISCAL.xlsx	2025-08-25 19:53:04.849678	2025-08-26 03:09:32.918535
113	GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	2023	.pdf	277260	4125c24fb06ed2d26e492e84c25a838ec6c3cf0e9326d49c02c8b9baf7178181	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	2025-08-25 19:53:04.850442	2025-08-26 03:09:32.918535
114	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf	2023	.pdf	901255	3ee5c2ca8218c9674acbede4fdfb50b8f794b877adc443ef5e307c29f4060f08	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf	2025-08-25 19:53:04.852128	2025-08-26 03:09:32.918535
115	SUELDOS-MAYO-2023.pdf	2023	.pdf	426361	c0527043855b3ac643bffca66386fa767acea85df33b253225bd13438182d6ab	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf	2025-08-25 19:53:04.853155	2025-08-26 03:09:32.918535
116	Resolución 1691_2023.pdf	2023	.pdf	109934	d0705b08bd3ae42179040e06a1a062207f2db69fe2a27ed8756d2f2165ec01f1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1691_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1691_2023.pdf	2025-08-25 19:53:04.853849	2025-08-26 03:09:32.918535
117	Resolución 828_2023.pdf	2023	.pdf	113189	0844d9d6eca2d368ce60882b1ddbcda941dbf5a0480344a5371558fccdb89176	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 828_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 828_2023.pdf	2025-08-25 19:53:04.854155	2025-08-26 03:09:32.918535
119	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI.pdf	2023	.pdf	85219	1d993b326aa0b8c74e0021bfe79bfb0afa4c86cfc201249813ac706553598aa8	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI.pdf	2025-08-25 19:53:04.854895	2025-08-26 03:09:32.918535
120	SUELDOS-JULIO-2023.pdf	2023	.pdf	423892	8faf1bf409d47260ea562b4ee642a990bde54681687703a62ee9e2e930023bcd	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-JULIO-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-JULIO-2023.pdf	2025-08-25 19:53:04.856186	2025-08-26 03:09:32.918535
121	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf	2023	.pdf	966410	8ce37262f32bc87d683b2ae8a39ca0093ee42d40452a8ca9070a418a14a3193d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf	2025-08-25 19:53:04.857892	2025-08-26 03:09:32.918535
122	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE.pdf	2023	.pdf	102641	5872165b737a1ebe62afb3b4ddb55bab58aae7d10e89d9c2c05cbecbe270c1dd	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE.pdf	2025-08-25 19:53:04.858579	2025-08-26 03:09:32.918535
123	ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf	2023	.pdf	1164653	c46dd8876a0dbd8b1f9e6ed92b3bd1172709988be1046ed3914c437d5b83c8d6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf	2025-08-25 19:53:04.860369	2025-08-26 03:09:32.918535
124	EJECUCION-PRESUPUESTARIA-DE-RECURSOS.pdf	2023	.pdf	469905	484ea7e10649585b0a82866c012b1feb58dace2d5f68067464e53cc01a384993	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/EJECUCION-PRESUPUESTARIA-DE-RECURSOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/EJECUCION-PRESUPUESTARIA-DE-RECURSOS.pdf	2025-08-25 19:53:04.861483	2025-08-26 03:09:32.918535
125	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2.pdf	2023	.pdf	67534	7ae065cb66d61c6942d686e332cc25f3921fcfc3cf00410644d24bfa93de5163	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2.pdf	2025-08-25 19:53:04.862139	2025-08-26 03:09:32.918535
126	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf	2023	.pdf	967123	416435286e2fce23b88d6d6be16e6cefff650ad3d90c72328f2b8ddd49493497	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf	2025-08-25 19:53:04.86361	2025-08-26 03:09:32.918535
127	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	2023	.pdf	102727	0ac5b5091f01ddc827b061b3f414ed2aec1d3f408d747d04ebf6bbed7785168d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	2025-08-25 19:53:04.864964	2025-08-26 03:09:32.918535
128	CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-4°TRIMESTRE-2023.pdf	2023	.pdf	93817	d4c4f37676024e09f66f93625a4bceb409149efac314d8c598e6d1746ff940f1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-4°TRIMESTRE-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-4°TRIMESTRE-2023.pdf	2025-08-25 19:53:04.86568	2025-08-26 03:09:32.918535
129	GASTOS-POR-CARACTER-ECONOMICO.pdf	2023	.pdf	399044	fb7b94568fa136064c9d70c419494a6c7a11e8aa4256814bd7d4e3a6de0fd610	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/GASTOS-POR-CARACTER-ECONOMICO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/GASTOS-POR-CARACTER-ECONOMICO.pdf	2025-08-25 19:53:04.866723	2025-08-26 03:09:32.918535
130	SITUACION-ECONOMICO-FINANCIERA.pdf	2023	.pdf	227255	1c3648564ea79e7485c21ac60d9e6e53a8d08c42af24a8550b9a0eb1f381cbb5	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICO-FINANCIERA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICO-FINANCIERA.pdf	2025-08-25 19:53:04.867422	2025-08-26 03:09:32.918535
131	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2.pdf	2023	.pdf	102665	46e3161758ab366576a2e38d58389174e0545d9f694d088768901d32fa3b8969	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2.pdf	2025-08-25 19:53:04.867979	2025-08-26 03:09:32.918535
132	SUELDOS-JUNIO-2023.pdf	2023	.pdf	423887	3c0ed2f6f40d32581632d1296b81b85e63f37bc55e03a3cc8708bff25f533f35	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-JUNIO-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-JUNIO-2023.pdf	2025-08-25 19:53:04.869077	2025-08-26 03:09:32.918535
133	ESTADO-DE-EJECUCION-DE-RECURSOS-2023-4°TRI.pdf	2023	.pdf	143218	648e058f6e2b4fd2cf13fc7615e2d81d487f521590c091be4f225f9bf72604d3	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-2023-4°TRI.pdf	2025-08-25 19:53:04.869765	2025-08-26 03:09:32.918535
134	SUELDOS-ENERO-2023.pdf	2023	.pdf	423903	f46bb8822a5cdb21086d5302960ec071ff71699003041a05e5c202c69eaa3e70	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-ENERO-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-ENERO-2023.pdf	2025-08-25 19:53:04.870628	2025-08-26 03:09:32.918535
135	CAIF-3°TRIMESTRE.pdf	2023	.pdf	94706	d258fe4597c35958825d561616a051dba40160fb611911a4b6803165454db305	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-3°TRIMESTRE.pdf	2025-08-25 19:53:04.871313	2025-08-26 03:09:32.918535
136	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2023-4°TRI.pdf	2023	.pdf	69801	c79cc06ec688d509a4123f46bba8a8fa7fe02a31c9920546784b05eeceb03ead	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2023-4°TRI.pdf	2025-08-25 19:53:04.871546	2025-08-26 03:09:32.918535
137	GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	2023	.pdf	387375	c316164553920b51cb7afbf9009320e54e0ab8f9099161fd9756cff634ce77d2	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	2025-08-25 19:53:04.872411	2025-08-26 03:09:32.918535
138	ESTADO-DE-EJECUCION-DE-RECURSOS-3°TRIMESTRE.pdf	2023	.pdf	140098	d35c0fe49cbad094849e10a91fa3865e39b35b10730bd9b8ebdeaf461151a50e	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-3°TRIMESTRE.pdf	2025-08-25 19:53:04.872783	2025-08-26 03:09:32.918535
139	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRIMESTRE.pdf	2023	.pdf	85386	c785170fd84deba5735fd324a078a5123e5d4cc46ba6c98b43376d47e2531ba2	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRIMESTRE.pdf	2025-08-25 19:53:04.873347	2025-08-26 03:09:32.918535
140	RECURSOS-AFECTADOS-VS-GASTOS.pdf	2023	.pdf	419672	a42a846701bd9b1fada50f7351a590596831f163444b64d85e189bc2b2e4426d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/RECURSOS-AFECTADOS-VS-GASTOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/RECURSOS-AFECTADOS-VS-GASTOS.pdf	2025-08-25 19:53:04.874164	2025-08-26 03:09:32.918535
141	LICITACION-PUBLICA-N°7.pdf	2023	.pdf	808836	aca9bfcacb7eb305dd650b9b28a206362f0b027e1ff9a3f135c3b380ab42291e	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°7.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°7.pdf	2025-08-25 19:53:04.875691	2025-08-26 03:09:32.918535
142	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2.pdf	2023	.pdf	109758	2db8629dcbf32354177d38d0a07f390dcb9394dc89d0fd8a9557518be40493c1	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2.pdf	2025-08-25 19:53:04.876388	2025-08-26 03:09:32.918535
143	CAIF-3.pdf	2023	.pdf	93841	8ce662a554934cae3312ff292e93cc5940903a5f6aaaebaa4088019c136e35c2	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF-3.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF-3.pdf	2025-08-25 19:53:04.877047	2025-08-26 03:09:32.918535
144	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	2023	.pdf	99892	d4ad8d5154f9246807e8883b107f9e35d6ede6335645958e37c7c6707d6760b6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	2025-08-25 19:53:04.877595	2025-08-26 03:09:32.918535
145	EJECUCION-DE-GASTOS.pdf	2023	.pdf	2036729	48a89dad650dceff484c10889816bd424cda0e716b3cb6a37ffc2564cd37759c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/EJECUCION-DE-GASTOS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/EJECUCION-DE-GASTOS.pdf	2025-08-25 19:53:04.880018	2025-08-26 03:09:32.918535
146	ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf	2023	.pdf	1152329	6eadd93f417a8684d61295ae1ba1e3a3cb37c7c19d24a0f8b17e4c3de36161d7	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf	2025-08-25 19:53:04.882061	2025-08-26 03:09:32.918535
147	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI.pdf	2023	.pdf	101956	53306e1153884c66096ca0005169d07ed9c417121d54321ad16e3e33a505cb96	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI.pdf	2025-08-25 19:53:04.882641	2025-08-26 03:09:32.918535
148	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2.pdf	2023	.pdf	125901	e00625e929b2d148c98e02f8fd0d697d5034e19be5555349e7931902c21d5b6c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2.pdf	2025-08-25 19:53:04.883208	2025-08-26 03:09:32.918535
149	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-3°TRIMESTRE.pdf	2023	.pdf	68205	64a8adaf2fdba8238fd84584112eedd31a1b5cec79496fcaef4998d26219b17c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-3°TRIMESTRE.pdf	2025-08-25 19:53:04.883799	2025-08-26 03:09:32.918535
150	Resolución 3016_2023.pdf	2023	.pdf	110132	19b40c8d9f088b7b841920f1ea7db8ebe3c94fb3341c42f3045b6a67b00c9f7c	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 3016_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 3016_2023.pdf	2025-08-25 19:53:04.884424	2025-08-26 03:09:32.918535
151	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	2023	.pdf	114620	782401fa254feb8ddb2873cd0e5de1ab9a821bf07164a1f30aaafe72b1bc1323	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	2025-08-25 19:53:04.885413	2025-08-26 03:09:32.918535
152	LICITACION-PUBLICA-N°8.pdf	2023	.pdf	809403	a2f62b95099ab076e4ff621ab5d14bc649738ec70de0831ca9f3be7bff9cf59b	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°8.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°8.pdf	2025-08-25 19:53:04.886773	2025-08-26 03:09:32.918535
153	MODULO-FISCAL_1.xlsx	2023	.xlsx	14412	fe57d7064f806964ece7f57a6ad9b230cfafac18e503c843cf7a3bfd8bc3b54c	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/MODULO-FISCAL_1.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/MODULO-FISCAL_1.xlsx	2025-08-25 19:53:04.887117	2025-08-26 03:09:32.918535
154	SUELDOS-SEPTIEMBRE-2023.pdf	2023	.pdf	428996	5a6458a5ebc89489f7749cd110053a19a4060b9c4f7b13cf6a01b03325f5f379	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-SEPTIEMBRE-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-SEPTIEMBRE-2023.pdf	2025-08-25 19:53:04.888051	2025-08-26 03:09:32.918535
155	LICITACION-PUBLICA-N°9.pdf	2023	.pdf	735593	e625b3186807e104214e98dfc2532cf328ae8c476f85de4900a32e0b842797aa	public_tender	contracts	high	{licitacion}	https://carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°9.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/LICITACION-PUBLICA-N°9.pdf	2025-08-25 19:53:04.889652	2025-08-26 03:09:32.918535
156	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2023-4°TRI.pdf	2023	.pdf	119224	f837693724d91e940ede9c6ce0b1b40691777fdebad4af1a8636d0cb2117c4f2	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2023-4°TRI.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2023-4°TRI.pdf	2025-08-25 19:53:04.890484	2025-08-26 03:09:32.918535
157	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf	2023	.pdf	923042	959fceaf31f6099c232ed8a63ec71e7b7334dc61ba0284d3315fff19c6240304	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf	2025-08-25 19:53:04.891892	2025-08-26 03:09:32.918535
158	RECURSOS-POR-CARACTER-ECONOMICO.pdf	2023	.pdf	389290	a2b146cf1771a4275971cf42a256bc9b789758698fba361d74829531a2209cde	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/RECURSOS-POR-CARACTER-ECONOMICO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/RECURSOS-POR-CARACTER-ECONOMICO.pdf	2025-08-25 19:53:04.893137	2025-08-26 03:09:32.918535
159	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2.pdf	2023	.pdf	84880	3d259a10eebff6b80812be1ae92ae7122f2b1e6036e4c8b0450278cf526eda6d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2.pdf	2025-08-25 19:53:04.893635	2025-08-26 03:09:32.918535
160	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	2023	.pdf	111422	4e83b6de075c5ac255c48f0f04244fb9a86cadb421617d68c688590c7fbc660c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	2025-08-25 19:53:04.89415	2025-08-26 03:09:32.918535
161	Resolución 297_2023.pdf	2023	.pdf	109873	c1c78d253f20c91afbd5ef6866610c67d5d92badcdc49792e90b1c7a2eb1029d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 297_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 297_2023.pdf	2025-08-25 19:53:04.894712	2025-08-26 03:09:32.918535
162	SITUACION-ECONOMICA-FINANCIERA-2.pdf	2023	.pdf	72410	57d5e4fbca388e26460809c7acf2a66dc5b4d79d336b07a82aa147ee47b2c0ed	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-2.pdf	2025-08-25 19:53:04.895257	2025-08-26 03:09:32.918535
163	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-3°TRIMESTRE.pdf	2023	.pdf	119668	f7d12a5f4353fe34d27bc2c879a1caad55d8ab8f5b2ae7fde7d867f8e69b5257	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-3°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-3°TRIMESTRE.pdf	2025-08-25 19:53:04.895819	2025-08-26 03:09:32.918535
164	ESTADO-DE-EJECUCION-DE-RECURSOS-2.pdf	2023	.pdf	154286	7232b7070585c0069593be5ac4c0ca503144c30f4df83cc325c148b43ddb81e7	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-2.pdf	2025-08-25 19:53:04.896541	2025-08-26 03:09:32.918535
165	GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf	2023	.pdf	307185	5802a647d25c987455122e3d53d7ceb57278eea36756f78ae08cec038e3ea1fd	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf	2025-08-25 19:53:04.8978	2025-08-26 03:09:32.918535
166	Resolución 1556_2023.pdf	2023	.pdf	118826	d2488a7e14125b45d2370a3ce06630c1af61db2aa7adfba7dd155609061be85b	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1556_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1556_2023.pdf	2025-08-25 19:53:04.898348	2025-08-26 03:09:32.918535
167	CAIF.pdf	2023	.pdf	374238	fd53ce92941ee2ab4d29463bd9fd305c99752eca4e87b5d170d6f2ad010f8fe3	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CAIF.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CAIF.pdf	2025-08-25 19:53:04.899322	2025-08-26 03:09:32.918535
168	SUELDOS-MARZO-2023.pdf	2023	.pdf	424532	f375c75e5ccfa6deece76e54f07212adb9c8590222716f386ee694e643b3fffc	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/SUELDOS-MARZO-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-MARZO-2023.pdf	2025-08-25 19:53:04.900418	2025-08-26 03:09:32.918535
169	ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf	2023	.pdf	87336	910a81f6b53cc206be09d5f109d8246393d29e093cbdfa98621f4435b77a49e7	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf	2025-08-25 19:53:04.90108	2025-08-26 03:09:32.918535
170	Resolución 790_2023.pdf	2023	.pdf	111032	a562a8a6e2a908fc2d83790b66c231c02057269909758373eba74e6e441b1cf2	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 790_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 790_2023.pdf	2025-08-25 19:53:04.901706	2025-08-26 03:09:32.918535
171	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2.pdf	2023	.pdf	101611	0234d274672c198ae963fe47dbacce1e8b02095e7ad63da982b855a64557ebd7	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2.pdf	2025-08-25 19:53:04.902292	2025-08-26 03:09:32.918535
172	SITUACION-ECONOMICA-FINANCIERA-4°TRIMESTRE.pdf	2023	.pdf	89080	2ba47d2c3b626473b13de82698d87d76cfc91e69e8e174ea87c7b75e24fa331e	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-4°TRIMESTRE.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SITUACION-ECONOMICA-FINANCIERA-4°TRIMESTRE.pdf	2025-08-25 19:53:04.902823	2025-08-26 03:09:32.918535
173	Resolución 1536_2023.pdf	2023	.pdf	109640	7ce2540c02c67ca1d3df2028522c155a09dbd003efb4ee6be2d729cb3b5847be	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 1536_2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 1536_2023.pdf	2025-08-25 19:53:04.903328	2025-08-26 03:09:32.918535
174	ESTADO-DE-EJECUCION-DE-GASTOS-POR-PERSPECTIVA-DE-GENERO-4°TRIMESTRE-2023.pdf	2023	.pdf	85281	2e1515de2cf28604adb6fe79f62661c5166ae492f90620eca3c9491ac5e425b5	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-PERSPECTIVA-DE-GENERO-4°TRIMESTRE-2023.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESTADO-DE-EJECUCION-DE-GASTOS-POR-PERSPECTIVA-DE-GENERO-4°TRIMESTRE-2023.pdf	2025-08-25 19:53:04.90393	2025-08-26 03:09:32.918535
175	RECURSOS-POR-PROCEDENCIA.pdf	2023	.pdf	362991	6a7ceab2efb87ac1518f96e1238e0a1c2e0b6f2810696f7151cf8fd4e9341a5e	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/RECURSOS-POR-PROCEDENCIA.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/RECURSOS-POR-PROCEDENCIA.pdf	2025-08-25 19:53:04.904779	2025-08-26 03:09:32.918535
176	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	2024	.pdf	294922	e4f48d0c2926a7e5457a68722f1d7af287e80dbd4171f13b1348ea1bab2e445c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	2025-08-25 19:53:04.905844	2025-08-26 03:09:32.918535
177	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-4toTrimestres.pdf	2024	.pdf	417054	fda863c9e4742fc63d121bb8c6f67a75ffb678697ce46924bb933e60ad8ea1f4	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-4toTrimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-4toTrimestres.pdf	2025-08-25 19:53:04.90683	2025-08-26 03:09:32.918535
179	Estado-de-Ejecucion-de-Recursos-Marzo.pdf	2024	.pdf	464068	9dc5180c8321b1fceb8c9df4956c32cc2c5f19a37c968e8d80d08c4849c7a76e	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	2025-08-25 19:53:04.908268	2025-08-26 03:09:32.918535
180	.DS_Store	2024		10244	283125cba7625bee41fa38776986b06603a7d31bfd66cdd8601d3299241b03f4	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/.DS_Store	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/.DS_Store	2025-08-25 19:53:04.908526	2025-08-26 03:09:32.918535
182	Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 62_2024 de la Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte.pdf	2024	.pdf	962920	43a6c38f46a6c30f7bcbaf2172f69562672e604bf4c747089e343ebb372db1f6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 62_2024 de la Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 62_2024 de la Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte.pdf	2025-08-25 19:53:04.910449	2025-08-26 03:09:32.918535
183	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	2024	.pdf	398461	54924fb94e4ca7432e34311a62a0e6b8f0d45d3f4488146d42e5e119cd1e573d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	2025-08-25 19:53:04.911591	2025-08-26 03:09:32.918535
251	Situacion-Economico-Financiera-Junio.pdf	2025	.pdf	224374	4d3cda4a2333195d1d47e54c3a04dfe0d76061cbaa331cfee2101411f43122f1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Junio.pdf	2025-08-25 19:53:04.996693	2025-08-26 03:09:32.918535
184	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	2024	.pdf	388038	2d9df7a81196bce0e5a48dc2381d0e8cbd51ceee73a7b6951f2222915ea88752	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	2025-08-25 19:53:04.912645	2025-08-26 03:09:32.918535
185	Estado-de-Ejecucion-de-Gastos-Junio.pdf	2024	.pdf	1967737	874761519e04b458479a032f31860458ae9ab38253c5f241f9a9d0067b20ff2f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Junio.pdf	2025-08-25 19:53:04.91491	2025-08-26 03:09:32.918535
186	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf	2024	.pdf	930421	caf4336bbf7b76e62adf3902fb3a7cff47dd376729e1ec44cd08bef5a017c155	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf	2025-08-25 19:53:04.916555	2025-08-26 03:09:32.918535
187	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	2024	.pdf	361665	b8fd4047379f92c5f3249af079f979c2de83a26c8b3755bbb4bf6ec887b783aa	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	2025-08-25 19:53:04.91795	2025-08-26 03:09:32.918535
188	ESCALA-SALARIAL-OCTUBRE-2024.pdf	2024	.pdf	434499	012eb13ac4865f3b77360ea43210993993ff7b3c7bce8afb3c9a3c4673656d55	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/ESCALA-SALARIAL-OCTUBRE-2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESCALA-SALARIAL-OCTUBRE-2024.pdf	2025-08-25 19:53:04.919004	2025-08-26 03:09:32.918535
189	Situacion-Economico-Financiera-Junio.pdf	2024	.pdf	224328	c96a1ed230645586c5ebd285fcc0b835423a7c2aa4f9e41b2a00aad9a22e9211	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Junio.pdf	2025-08-25 19:53:04.919892	2025-08-26 03:09:32.918535
190	Estado-de-Ejecucion-de-Recursos-3er-Trimestres.pdf	2024	.pdf	471919	eff7a700920e8703d48ecc299217d82974c3eb6bea3fafd5f985e9883ebbc3bd	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-3er-Trimestres.pdf	2025-08-25 19:53:04.920868	2025-08-26 03:09:32.918535
191	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf	2024	.pdf	388869	e7095588496ac652cb708e7e33fde4ba5fabd41a996f78f051c535b0bd38defd	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf	2025-08-25 19:53:04.921629	2025-08-26 03:09:32.918535
192	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	2024	.pdf	387766	a46fadb9a16c7866650739fef3d1e134284c773140b08a697b3742288d8833d2	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	2025-08-25 19:53:04.922889	2025-08-26 03:09:32.918535
193	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	2024	.pdf	275027	e2ddf5be5abcecdbc8e2ec509decfdace401249b01571cd8ab1b75935e1c030b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	2025-08-25 19:53:04.923754	2025-08-26 03:09:32.918535
194	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf	2024	.pdf	276006	1bc732bc7316a4f5b6a0e6ec2681d32feee67584dbb15d65e7e3c771265e0b6f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf	2025-08-25 19:53:04.924694	2025-08-26 03:09:32.918535
195	Resolución 539_2024.pdf	2024	.pdf	122360	c9a1fb1167829aef4417626cb278f872c1f33c563ebf04be6e3f299ce2c14851	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 539_2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 539_2024.pdf	2025-08-25 19:53:04.925305	2025-08-26 03:09:32.918535
196	Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf	2024	.pdf	2137158	c58c3d1ea333b33b46e2edcf62505b8c3a48ac08e62b5074fae2d71495edca9d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf	2025-08-25 19:53:04.927841	2025-08-26 03:09:32.918535
197	Resolución 867_2024.pdf	2024	.pdf	116656	816a62ef77df9f37e9b056048f2accbfd8a9bbe0f270f224912ce61818ed6bfe	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 867_2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 867_2024.pdf	2025-08-25 19:53:04.928202	2025-08-26 03:09:32.918535
198	Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf	2024	.pdf	370357	f1bd5e531456c1c410b0ac930e6e4d7844002492396a9289f00612ac865432f5	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf	2025-08-25 19:53:04.929403	2025-08-26 03:09:32.918535
199	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-3er-Trimestres.pdf	2024	.pdf	418941	98e5962fbcbff54a4a024af8e10d8824bf3c3eda4f3db12e7b99c57a0b6704d4	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-3er-Trimestres.pdf	2025-08-25 19:53:04.930082	2025-08-26 03:09:32.918535
200	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	2024	.pdf	413246	9f5b362cd36885d3393367bb8174fee985a46a490fda5d08c872c7018d74d846	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	2025-08-25 19:53:04.930851	2025-08-26 03:09:32.918535
201	Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf	2024	.pdf	374659	36443068ed8efb243ff4c0bee2ec5ea067f5243bb802265fd9d2edc3d7c24f7d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf	2025-08-25 19:53:04.931245	2025-08-26 03:09:32.918535
202	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf	2024	.pdf	294013	9a125a073c60037d839bdf096937614e895c2767e9fe7ca263cf6940210e5117	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf	2025-08-25 19:53:04.932069	2025-08-26 03:09:32.918535
203	README.md	2024	.md	1564	30ff4018e441872b96499dcf18dee0a91e8fd17bed9e95eba14c020ad6761e1d	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/README.md	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/README.md	2025-08-25 19:53:04.93224	2025-08-26 03:09:32.918535
204	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	2024	.pdf	362628	9ca20572c11d3a60741b778f76c5e6288ad288211ed403f80d97b92cfd3907da	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	2025-08-25 19:53:04.932949	2025-08-26 03:09:32.918535
205	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf	2024	.pdf	963545	1975b3e4209305619faa51e203189e44332de41e25bde4802756d06e2f730a10	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf	2025-08-25 19:53:04.934521	2025-08-26 03:09:32.918535
206	CONSULTA-IMPOSITIVA-VIGENTE-.xlsx	2024	.xlsx	57712	8fabef6454699b8ed67281bbe450aa214e96bbdb544cba1eef9f8e1f07a68e14	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/CONSULTA-IMPOSITIVA-VIGENTE-.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/CONSULTA-IMPOSITIVA-VIGENTE-.xlsx	2025-08-25 19:53:04.935089	2025-08-26 03:09:32.918535
207	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	2024	.pdf	399307	f7fa8bd469c38fbbad04da87180fda46923f820f7e9ed894ce1e78a27826a4b2	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	2025-08-25 19:53:04.936057	2025-08-26 03:09:32.918535
208	Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf	2024	.pdf	361491	ec7ff9715e2076eb615f8a0de37c3d3c4257dbaa7b7f2ee6630b70607950a20d	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf	2025-08-25 19:53:04.936918	2025-08-26 03:09:32.918535
209	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	2024	.pdf	389286	23eafa7a8105c46da2d3e1974e7b96032bb4fbac3ca133acf8744a4d517f1e86	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	2025-08-25 19:53:04.937954	2025-08-26 03:09:32.918535
210	Estado-de-Ejecucion-de-Gastos-Marzo.pdf	2024	.pdf	1801842	ceda375dcda211334b1d037ac60ed1c8d11d8f4a4f44578be523e59330d1084a	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	2025-08-25 19:53:04.940586	2025-08-26 03:09:32.918535
211	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf	2024	.pdf	295227	ea08cbab669263a858d3ea1d2d9cee8402e7f54db42d6e12ea91e87ffaeed19b	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf	2025-08-25 19:53:04.941464	2025-08-26 03:09:32.918535
212	Estado-de-Ejecucion-de-Recursos-4toTrimestres.pdf	2024	.pdf	471414	ba7910ad37105ad86dcb852d9c6f4f8db59316643ed92ed33e818d16fda94800	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-4toTrimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-4toTrimestres.pdf	2025-08-25 19:53:04.94245	2025-08-26 03:09:32.918535
213	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf	2024	.pdf	278896	c598acc527f92993ade1139a24c3fe9b668be66dbaa672d390240dce826c45dc	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf	2025-08-25 19:53:04.943245	2025-08-26 03:09:32.918535
214	Disposición 62_2024.pdf	2024	.pdf	121670	71f31661ac2497704d036d0f281afd25326c2a5d5f42dda9f3df087d37ae991a	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Disposición 62_2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Disposición 62_2024.pdf	2025-08-25 19:53:04.943919	2025-08-26 03:09:32.918535
215	Estado-de-Ejecucion-de-Recursos-Junio.pdf	2024	.pdf	470734	5cb7f6ef63b9f6e1d18e5f0e53915548744f21e4884a2f192a0cf0342c5e3943	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Junio.pdf	2025-08-25 19:53:04.94525	2025-08-26 03:09:32.918535
216	Situacion-Economico-Financiera-3er-Trimestre.pdf	2024	.pdf	226061	f5cc5695ee5713a00ad14c54c1326fe47bb9fa18d32ae4c0495ca7cda9aec247	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-3er-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-3er-Trimestre.pdf	2025-08-25 19:53:04.946041	2025-08-26 03:09:32.918535
217	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf	2024	.pdf	386959	1c53ae8c000b795f35af498d6182111a5983ca4ae0c2c3174b1629d8d05cbab7	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf	2025-08-25 19:53:04.947098	2025-08-26 03:09:32.918535
218	Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf	2024	.pdf	362364	e4b824630ee51b686514fea747b6df223672ac25c44bad7eb15f326524188a73	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf	2025-08-25 19:53:04.948122	2025-08-26 03:09:32.918535
219	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf	2024	.pdf	400441	726165a5adace0ed7efa3cd43e2139b7ffca5978a95dd3de34eb08bc8ff384a0	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf	2025-08-25 19:53:04.948923	2025-08-26 03:09:32.918535
220	03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx	2024	.xlsx	20580	c0a9d9707e2be7f2d72fd32cd848e27e766ba078a85f1b5925118c70fb3aa8b9	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx	2025-08-25 19:53:04.949282	2025-08-26 03:09:32.918535
221	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	2024	.pdf	294085	32b51dd36b8b5ddeefa9aeb2ea64acbccb1d2b17c32d8aafa5fd4a5a09be80d5	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	2025-08-25 19:53:04.950304	2025-08-26 03:09:32.918535
222	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf	2024	.pdf	389471	b70186be3673a7c4e430ddde4372c9b4fd1ecfb9604679caa59f849e1028de84	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf	2025-08-25 19:53:04.951391	2025-08-26 03:09:32.918535
223	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf	2024	.pdf	386059	d5fd3315d8aa8d87d999138883ddeb1b44fb2a992a44024bd052b310be45a0e6	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf	2025-08-25 19:53:04.952228	2025-08-26 03:09:32.918535
224	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf	2024	.pdf	922622	c643e42fe0944fcd50e3426cc1a313f271a82f77bc341fdc39f8c43d8c34acf6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf	2025-08-25 19:53:04.953777	2025-08-26 03:09:32.918535
225	Resolución 2623_2024.pdf	2024	.pdf	111987	9284181234d2751256cefc778fe3065add1bb266eaa07b2ba9f9ad931a976aa6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 2623_2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 2623_2024.pdf	2025-08-25 19:53:04.954493	2025-08-26 03:09:32.918535
226	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	2024	.pdf	418582	57699ba7d54424c6b83dfe5a15d0c9fe1b4ddd21ca0cb66e6e92d207fc06f5b4	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	2025-08-25 19:53:04.955489	2025-08-26 03:09:32.918535
227	Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf	2024	.pdf	2071972	8647e5d72e97edc7a074f407068cd09ec5106f222c92bf49a953a92945dd4204	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf	2025-08-25 19:53:04.958166	2025-08-26 03:09:32.918535
228	Resolución 466_2024.pdf	2024	.pdf	106965	285055769f245edd06aeb7be67df1d62f26c4828fded005736c3e83a6bac3e39	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Resolución 466_2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Resolución 466_2024.pdf	2025-08-25 19:53:04.958451	2025-08-26 03:09:32.918535
229	ORDENANZA-IMPOSITIVA-3202-24.pdf	2024	.pdf	22469309	f209255329af8d503eb1749362bd6c96e526f87c37cbc6b806f0bc706696b3c3	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ORDENANZA-IMPOSITIVA-3202-24.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ORDENANZA-IMPOSITIVA-3202-24.pdf	2025-08-25 19:53:04.972324	2025-08-26 03:09:32.918535
230	PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf	2024	.pdf	9629038	98ebd96bc481b194f266de5a2ffd3a146d72e83b2988829ed1e32a0b37fcdc34	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf	2025-08-25 19:53:04.979562	2025-08-26 03:09:32.918535
231	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	2024	.pdf	278043	34ad4c9be2e64fdc441cabf3b6d6b99017aa9c5cbe3c177deb08139c0b47d9d3	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	2025-08-25 19:53:04.98049	2025-08-26 03:09:32.918535
232	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf	2024	.pdf	901068	b8904e79604fc1affbb1c8c1335b61fe89e2e913124768213d54e0fc2444f4aa	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf	2025-08-25 19:53:04.981897	2025-08-26 03:09:32.918535
233	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf	2024	.pdf	397512	c704de18642ef3a2cae2e2c324e6603017c5be091ece9c5fbcc95d45775459d0	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf	2025-08-25 19:53:04.983147	2025-08-26 03:09:32.918535
234	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	2024	.pdf	388402	960b87afdf19973a49343cec49f9f67590fcd533802c38a4faeb221898efb6de	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	2025-08-25 19:53:04.983944	2025-08-26 03:09:32.918535
235	Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	2024	.pdf	372895	a87d6bcd74a1590e6a3627aaa092ec47b077c77b5e45f41e01afad254dd79a49	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	2025-08-25 19:53:04.984994	2025-08-26 03:09:32.918535
236	Situacion-Economico-Financiera-Marzo.pdf	2024	.pdf	224229	0b09f42064bf14f39d0a6d51da8d52ad7fb001a63cd3bab7b00d3ba3fafafbe6	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Marzo.pdf	2025-08-25 19:53:04.98581	2025-08-26 03:09:32.918535
237	STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx	2024	.xlsx	20596	e86668e34a363985869dd1866ffb500ad37e0f8d3df1dea40fa3b03d7da6a96f	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx	2025-08-25 19:53:04.98617	2025-08-26 03:09:32.918535
238	ESCALAS-SALARIALES-FEBRERO-2024.pdf	2024	.pdf	428627	83f69d35929cdbd40d86a1a07aa219495acb0e58f2c4a8cab3c963413f057a72	salary_report	salaries	medium	{salario}	https://carmendeareco.gob.ar/transparencia/ESCALAS-SALARIALES-FEBRERO-2024.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ESCALAS-SALARIALES-FEBRERO-2024.pdf	2025-08-25 19:53:04.986947	2025-08-26 03:09:32.918535
240	ANEXO-II-ZONAS-IMPOSITIVAS.pdf	2025	.pdf	312765	12741d79e70bfaf16beac5f17237fd7f40a313ea312977485a57a9d555512813	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ANEXO-II-ZONAS-IMPOSITIVAS.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ANEXO-II-ZONAS-IMPOSITIVAS.pdf	2025-08-25 19:53:04.987964	2025-08-26 03:09:32.918535
241	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	2025	.pdf	287915	ab1883e079bd3e4983c43d78842421dcc9618b8d8449bc5b82a42a3cc64c88a1	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	2025-08-25 19:53:04.988776	2025-08-26 03:09:32.918535
243	Estado-de-Ejecucion-de-Recursos-Marzo.pdf	2025	.pdf	459999	be9be7d910fdf7007b93b9941d47fc8f6628574322d1b8148190bbccf2a090a5	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	2025-08-25 19:53:04.989794	2025-08-26 03:09:32.918535
244	Disposición 61_2025.pdf	2025	.pdf	102264	278d22223f611f025f59a0ce83b651390b5fea873afef7d3b3ea068656242935	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Disposición 61_2025.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Disposición 61_2025.pdf	2025-08-25 19:53:04.990378	2025-08-26 03:09:32.918535
245	.DS_Store	2025		6148	bbb369bbcfeb1b7011f799d5215170f4400e54cb05b5289b293b35078fb794eb	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/.DS_Store	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/.DS_Store	2025-08-25 19:53:04.990589	2025-08-26 03:09:32.918535
246	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	2025	.pdf	397604	a98757a4754a94ae7451d477641f0939dc0feb3b5bce83c39e30d77d66e7e492	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	2025-08-25 19:53:04.991414	2025-08-26 03:09:32.918535
247	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	2025	.pdf	387205	489697d1ba5e333563e0bbc6abf730f6a502dee94094178fcb1421538ac648e1	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	2025-08-25 19:53:04.992453	2025-08-26 03:09:32.918535
248	Estado-de-Ejecucion-de-Gastos-Junio.pdf	2025	.pdf	1872515	4dd94e4bd5eb67186147a9293ed85db13aad6c7cdd9f65f97b5d24f8e912ebe8	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Junio.pdf	2025-08-25 19:53:04.99455	2025-08-26 03:09:32.918535
249	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	2025	.pdf	361206	affa65225aec2163f7efe665d394d61af9ba6b94eac36ef1a7f73df54e023279	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	2025-08-25 19:53:04.995385	2025-08-26 03:09:32.918535
250	Cuenta-Ahorro-Inversion-Financiamiento-Junio.pdf	2025	.pdf	374759	bc133744d7865c3d09660d96b1ff4503ab179396e384a1c97b8d3cbe0bfe012b	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Junio.pdf	2025-08-25 19:53:04.996122	2025-08-26 03:09:32.918535
253	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	2025	.pdf	387930	7d3ccddca8fb3b8f31b2b1ed91c46ac8190b3aac4bdaa82647c3b3cb0d8c728f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	2025-08-25 19:53:04.998498	2025-08-26 03:09:32.918535
254	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	2025	.pdf	276458	7f09557c268b97bc144b3e35a544b2421a4a83b40581bf3d530ae130f8d2c39c	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	2025-08-25 19:53:04.999471	2025-08-26 03:09:32.918535
255	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	2025	.pdf	410450	2f28055c2e1df3b2283f4e23ba6aa875dabeb5a491078bf23b5a106c7ad4b7e9	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	2025-08-25 19:53:05.00038	2025-08-26 03:09:32.918535
256	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	2025	.pdf	362608	df5587bfd6c7b2257485c89f3c68a55ddd4c5ecd7e7b63656c31085211d49852	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	2025-08-25 19:53:05.001359	2025-08-26 03:09:32.918535
257	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	2025	.pdf	397346	f1a97a35e5325a2e0139fc0298ff7508650fce19b195dc758feb419b0a8c56a4	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	2025-08-25 19:53:05.002407	2025-08-26 03:09:32.918535
258	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	2025	.pdf	388601	657e795cccfca50b79ad49fbc3af921a81c6d399ca7c650afb39ff448b5543d0	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	2025-08-25 19:53:05.003394	2025-08-26 03:09:32.918535
259	Estado-de-Ejecucion-de-Gastos-Marzo.pdf	2025	.pdf	1777921	302f624762d78290862ec9a15639a8760f18dca7f686cd1113eb12368034c4a3	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	2025-08-25 19:53:05.005537	2025-08-26 03:09:32.918535
260	Estado-de-Ejecucion-de-Recursos-Junio.pdf	2025	.pdf	463491	cc95c83a6ab8c9fb567755afa0ff9fc941a59c90be2b0faf6620f97b99dc2f5f	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Junio.pdf	2025-08-25 19:53:05.006589	2025-08-26 03:09:32.918535
261	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	2025	.pdf	287416	37c59f6650444a6e1f8665aa6ba719eb4e24e502d37601bf627614f7e917f517	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	2025-08-25 19:53:05.007338	2025-08-26 03:09:32.918535
262	Situacion-Economico-Financiera-4to-Trimestre.pdf	2025	.pdf	305831	f901b71d01b5f721ce6192221f070adb937dabe36a547a20e18047438e5d3350	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-4to-Trimestre.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-4to-Trimestre.pdf	2025-08-25 19:53:05.008086	2025-08-26 03:09:32.918535
263	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	2025	.pdf	382115	0572c13dab859bf3f85f24c2fe3168147a18cd8bf706013e4a9ed21374de4076	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	2025-08-25 19:53:05.009154	2025-08-26 03:09:32.918535
265	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	2025	.pdf	277186	f1bf0d80ec91075182b068899dcefb94bff746ec949a42dce807df523023306a	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	2025-08-25 19:53:05.017272	2025-08-26 03:09:32.918535
266	ORDENANZA-IMPOSITIVA-3282-25.pdf	2025	.pdf	2810889	f601cf0523f0610cbb9365867910f872990007932edd9e353111474c2dc73122	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ORDENANZA-IMPOSITIVA-3282-25.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ORDENANZA-IMPOSITIVA-3282-25.pdf	2025-08-25 19:53:05.020091	2025-08-26 03:09:32.918535
267	ORDENANZA-FISCAL-3198-23.pdf	2025	.pdf	44626056	190343192cbc94ad53782e434d680c2af566ef165434f40fc5fbc1b4e95655c9	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/ORDENANZA-FISCAL-3198-23.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/ORDENANZA-FISCAL-3198-23.pdf	2025-08-25 19:53:05.047319	2025-08-26 03:09:32.918535
268	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	2025	.pdf	387591	6f39b1bf90fdf0b4398b6bc6baf8b556b3ed02ef597e7f798639ea010354f326	financial_report	budget	high	{presupuesto}	https://carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	2025-08-25 19:53:05.048454	2025-08-26 03:09:32.918535
269	Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	2025	.pdf	373199	82d4df351473e9c08b11f20b815d5341258c3af8337ee412c500fc502472c1e1	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	2025-08-25 19:53:05.049279	2025-08-26 03:09:32.918535
270	Situacion-Economico-Financiera-Marzo.pdf	2025	.pdf	225283	64b8bcc9a2a0bdac9198218bdf82a8bbe207e5b3d1cca01cb1ebf59b664fbfab	general	general	normal	{}	https://carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Marzo.pdf	https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/Situacion-Economico-Financiera-Marzo.pdf	2025-08-25 19:53:05.049953	2025-08-26 03:09:32.918535
\.


--
-- Data for Name: processing_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.processing_log (id, filename, action, status, message, processed_at) FROM stdin;
\.


--
-- Data for Name: property_declarations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_declarations (id, year, official_name, role, cuil, declaration_date, status, uuid, observations, public_verification, critical_review) FROM stdin;
2	2024	María González	Secretaria de Hacienda	27-87654321-0	2024-03-20 00:00:00+00	published	DDJJ-2024-002	Declaración presentada dentro del plazo	Verificada por Contraloría	Bienes inmuebles declarados consistentes con el cargo
\.


--
-- Data for Name: public_tenders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.public_tenders (id, year, title, description, budget, awarded_to, award_date, execution_status, delay_analysis) FROM stdin;
1	2024	Construcción de nuevo centro comunitario	Licitación para la construcción de un centro comunitario en el barrio San Martín	15000000.00	Constructora ABC S.A.	2024-02-10 00:00:00+00	in_progress	Sin demoras significativas reportadas
2	2024	Reparación de red de agua potable	Reparación y mantenimiento de la red de agua potable en zona sur	8500000.00	Servicios Hídricos S.R.L.	2024-01-25 00:00:00+00	completed	Finalizado dentro del plazo establecido
\.


--
-- Data for Name: salaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salaries (id, year, official_name, role, basic_salary, adjustments, deductions, net_salary, inflation_rate) FROM stdin;
\.


--
-- Data for Name: salary_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_details (id, document_id, employee_name, "position", department, basic_salary, bonuses, deductions, net_salary, period_year, period_month, created_at) FROM stdin;
\.


--
-- Data for Name: scraped_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scraped_sources (id, source_name, url, content_hash, last_scraped, status, response_time, content_size, documents_found) FROM stdin;
1	PROVINCIAL_TRANSPARENCY	https://www.gba.gob.ar	3f154d207e64523c7ffa267082bbf7bdca7bcd59df59aa4b6ccb9c3b49608e81	2025-08-25 11:33:28.18805	HTTP_200	\N	212528	0
2	NATIONAL_PORTAL	https://www.argentina.gob.ar	bab40ef641bc0153ffdf23d74aed8ee476760c81e85dfc94de456aeddb984b74	2025-08-25 11:33:28.29781	HTTP_200	\N	30719	0
3	INFORMATION_ACCESS	https://www.aaip.gob.ar	7aedc1bc86c5a8db13c95630a889554dfeee72074d693e2f83935d5c7ab7fe10	2025-08-25 11:33:29.658988	HTTP_200	\N	42276	0
\.


--
-- Data for Name: transparency_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transparency_documents (id, filename, original_path, category, document_type, year, quarter, month, content_preview, file_hash, file_size, processing_status, created_at) FROM stdin;
5	Resolución 206_2018.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Resolución 206_2018.pdf	Documentos Generales	general_document	2018	\N	\N	PDF processing not available	917af98d82d9823539c7a6ac25d45e5db7bca5d5ffae9f3b38574bb12c415a91	118435	updated	2025-08-25 11:30:47.008427
12	GANADERIA 2016-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/GANADERIA 2016-2020.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	403d443a2fc17f9134f9d072bbc6719a552b53116ac5bb1660448acdf6d135bb	546208	updated	2025-08-25 11:30:47.028172
7	Contrato_CGZzWR1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Contrato_CGZzWR1.pdf	Licitaciones y Contratos	public_tender	2018	\N	\N	PDF processing not available	932f98cbefc8df9d4068016d7658f32af37e075b08ce5a7feeb4fe9336276de7	252764	updated	2025-08-25 11:30:47.012644
14	EJECUCION-DE-RECURSOS-PERIODO-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/EJECUCION-DE-RECURSOS-PERIODO-2020.pdf	Ejecución Presupuestaria	budget_execution	2020	\N	\N	PDF processing not available	fbd2126dc38e4515c6991d5b057c0f8f04302a53e0bf0139fcf720c6a1b3bc97	347152	updated	2025-08-25 11:30:47.038949
1	Acta_de_Apertura_FEAsaU6.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2017/Acta_de_Apertura_FEAsaU6.pdf	Documentos Generales	general_document	2017	\N	\N	PDF processing not available	960b15aa2880ac9111ebf67fafc0d671378626a0017c9abc7017e33565e988cd	40418	updated	2025-08-25 11:30:46.999851
16	INFORME-ECONÓMICO-FINANCIERO-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/INFORME-ECONÓMICO-FINANCIERO-2020.pdf	Reportes e Informes	statistical_report	2020	\N	\N	PDF processing not available	cee6b036047f369f19ab4c73ed55bd9a482f09f1833b4d2dfee6fbf25b872f66	1440758	updated	2025-08-25 11:30:47.044271
8	Acto_de_Adjudicacion_QmqNYiE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Acto_de_Adjudicacion_QmqNYiE.pdf	Documentos Generales	general_document	2018	\N	\N	PDF processing not available	9a1bbb85ca7d44235d9a3df9c961b3d47af48f047e30cc2d3ce635e0cf3a69c3	113410	updated	2025-08-25 11:30:47.013902
18	SITUACIÓN-ECONÓMICO-FINANCIERA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACIÓN-ECONÓMICO-FINANCIERA.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	121cf242ca8b1e634f9e6ae8938eb5c2f56f34c1eccad95af7f9fae1824fa188	988198	updated	2025-08-25 11:30:47.047845
15	CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-2020.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	1ff510ce12ffe1350e5572a662502c3fdfe35ed2a9fee0a5c3552ad22911c64f	361931	updated	2025-08-25 11:30:47.041926
17	SITUACION-ECONOMICA-FINANCIERA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-ECONOMICA-FINANCIERA.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	12c15f3752c5adaae566b63ab5445425961323386899bee3d6cc6399abf89ff4	71806	updated	2025-08-25 11:30:47.045678
2	RS-2017-03840811-GDEBA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2017/RS-2017-03840811-GDEBA.pdf	Documentos Generales	general_document	2017	\N	\N	PDF processing not available	b0067a8617c37514a39066815c5db4f3338a1a42d18166ef8169d3609914a292	110518	updated	2025-08-25 11:30:47.002901
10	Informe Económico 2019 _ Carmen de Areco - Municipio2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2019/Informe Económico 2019 _ Carmen de Areco - Municipio2.pdf	Reportes e Informes	statistical_report	2019	\N	\N	PDF processing not available	bf889813cb94ea931df8fad5f72b53184c208833b4117214c8fd1ab82187deb9	3935334	updated	2025-08-25 11:30:47.019944
4	Resolución 210_2018.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Resolución 210_2018.pdf	Documentos Generales	general_document	2018	\N	\N	PDF processing not available	8741299ac5d54cc0bbdca06e763d9295e4c9a86b18dbfe321b0d176287f09300	116936	updated	2025-08-25 11:30:47.006903
6	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 210_2018 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 210_2018 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2018	\N	\N	PDF processing not available	fe4590ed39c9aa13e53cad629af8a43f837223d2ab56147b0ae60898c13e1009	894125	updated	2025-08-25 11:30:47.010766
20	situacion-economica032.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/situacion-economica032.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	2ed308c06f1eff521803e6a59bf946b73df6ab66a63dde5c9d82e50f0de1f1af	651130	updated	2025-08-25 11:30:47.051411
21	EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf	Presupuesto Municipal	budget	2020	\N	\N	PDF processing not available	2c7bfb00e01916cc1436a9b2452c8300eef89c29fea41510d754f2e5c5b7c736	383011	updated	2025-08-25 11:30:47.05337
11	Informe Económico 2019 _ Carmen de Areco - Municipio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2019/Informe Económico 2019 _ Carmen de Areco - Municipio.pdf	Reportes e Informes	statistical_report	2019	\N	\N	PDF processing not available	1f1217a6535de9240fb849d744b87eee0a11c149c6180c4e34131b1f3e9890ac	4278204	updated	2025-08-25 11:30:47.024148
3	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 206_2018 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2018/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 206_2018 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2018	\N	\N	PDF processing not available	6d4d67c55622e8280c0036b3ea9257498713b3c77c9f5e3898ef3a984abd60a1	895552	updated	2025-08-25 11:30:47.005297
13	Resolución 1089_2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/Resolución 1089_2020.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	9fce74ac053d2e3062df8812649a8eca90a76e39158c3534c6202418775909c7	12619465	updated	2025-08-25 11:30:47.036946
9	2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2019/2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf	Documentos Generales	general_document	2019	\N	\N	PDF processing not available	09b42880fbf7707c1fb19ccf41aa284609f569788f746647f6a888582c6e1b09	1135686	updated	2025-08-25 11:30:47.015906
27	SITUACION-ECONOMICO-FINANCIERA-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-ECONOMICO-FINANCIERA-2020.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	7dc9f9da4ab2a7add95e0f33b0b1bf2ae1aa48116a483806c593bdcdf8d87ec9	220602	updated	2025-08-25 11:30:47.064138
34	2021%20HABILITACIONES%20MUNICIPALES.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20HABILITACIONES%20MUNICIPALES.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	5e6ac7e2a59b951c78f93cf1af23697a485c5a2c8eee5550a49dfa624aa8f8aa	524846	updated	2025-08-25 11:30:47.156796
35	Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 265_2021 de la Dirección de Fiscalización Vegetal del Ministerio de Desarrollo Agrario.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 265_2021 de la Dirección de Fiscalización Vegetal del Ministerio de Desarrollo Agrario.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	e7eea4db8ab0c33fded4a869303accb07792c3ba4d8b53cfff1a583c9ae7f108	926838	updated	2025-08-25 11:30:47.158723
37	COSECHA 2012-2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/COSECHA 2012-2021.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	a5a64d7cf83271b3bc2e35f2bae8fba21fe1b3db61a10b6779b4846ff76bd2a5	607800	updated	2025-08-25 11:30:47.162944
39	Disposición 265_2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/Disposición 265_2021.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	d9fdd7b0e44ce85b094364a38c1b1d3a7d6efa7cd6557dc281276f6e51648a8b	102719	updated	2025-08-25 11:30:47.166211
22	SITUACION-PATRIMONIAL-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-PATRIMONIAL-2020.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	0e70e2cee2135aec49a8149facad37618a3201375a6f35183ffdb0cf6b27bc12	191596	updated	2025-08-25 11:30:47.055373
24	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1089_2020 del MINISTERIO DE INFRAESTRUCTURA Y SERVICIOS PÚBLICOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1089_2020 del MINISTERIO DE INFRAESTRUCTURA Y SERVICIOS PÚBLICOS.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	d3dd27b87a3b425f6b1bf48f63f62818111e8f40ef66912ca71a62eeb9a2573e	964795	updated	2025-08-25 11:30:47.059458
25	BALANCE-GENERAL-2020.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/BALANCE-GENERAL-2020.pdf	Estados Financieros	financial_statement	2020	\N	\N	PDF processing not available	3b00ef7077e5c2df10b6934cd1838ed308bfbcf541982144573bf89ed9affb64	395513	updated	2025-08-25 11:30:47.061188
29	SALUD-CAP-2021-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/SALUD-CAP-2021-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	10e6db8aee4ae854404ffa012ea21806c70e42d95ef2396115fa66a48f9b5beb	434396	updated	2025-08-25 11:30:47.14319
31	Resolución 1838_2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/Resolución 1838_2021.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	451d01791917bbf8cad09839ca371335df72e6e1e52611714810614709f605a9	108917	updated	2025-08-25 11:30:47.148529
32	2021%20CAPS%20ESTADISTICAS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20CAPS%20ESTADISTICAS.pdf	Reportes e Informes	statistical_report	2021	\N	\N	PDF processing not available	2ec86694b6cfff4ce155c158f2b761581c83e3b6d5e78dbd14fd9b2ddc4ad8d5	508568	updated	2025-08-25 11:30:47.150799
33	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1838_2021 del Ministerio de Desarrollo de la Comunidad.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1838_2021 del Ministerio de Desarrollo de la Comunidad.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	e8ce6460af41fb6b1aa915869c872d9aa9a2d46864536a3f99a45e5df5ac1bfc	952468	updated	2025-08-25 11:30:47.154915
36	2021%20ESTADISTICAS%20OMIC.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20ESTADISTICAS%20OMIC.pdf	Reportes e Informes	statistical_report	2021	\N	\N	PDF processing not available	062d0991004ba3302c19e1e366955df44a8e79cf721bf981c08455d8071a0471	800550	updated	2025-08-25 11:30:47.160821
30	2021%20SERVICIOS%20PUBLICOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20SERVICIOS%20PUBLICOS.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	9d116a63c305a75fd754a0fa8e132a80a360254f5c9c9ce66b10aabb97dea733	651610	updated	2025-08-25 11:30:47.14569
26	SITUACION-ECONOMICA-FINANCIERA-3°TRI-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-ECONOMICA-FINANCIERA-3°TRI-2022.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	ac0caf6772fc436603311ab54f2907cf19d6bdaaa9916ae73475a295b8ba048c	72061	updated	2025-08-25 11:30:47.062646
23	SITUACION-ECONOMICA-FINANCIERA-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-ECONOMICA-FINANCIERA-3°TRIMESTRE.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	6a2785885a928f0eb585c365b449f9508d124b3fc883e01ac99d311015e40d53	72452	updated	2025-08-25 11:30:47.057247
51	ESTADO-DE-EJECUCION-DE-GASTOS-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	c96410bfe1d487c5a1adf85d05d5c5af26d5ff0ec3a520abe2ee3de8661aba3b	1141711	updated	2025-08-25 11:30:47.191332
52	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	ec96fbaf02d8dc368ada5a3139436c1960e1366f3dd0121a29175895f97f2491	957949	updated	2025-08-25 11:30:47.194602
53	Resolución 1146_2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Resolución 1146_2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	9210f527b0c3b635b0b4a719aae3f29cf6aaea359d1163a7e1cf7d923f610793	121789	updated	2025-08-25 11:30:47.196107
54	ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	ae54edfbcd1d15475e157fbbb692f7e604f97cb93db9a699769927d1276c941f	86333	updated	2025-08-25 11:30:47.197419
55	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	4a083772815e88766d34b06e2bb681cee0def5f6489325237964f5406b50b5dd	119210	updated	2025-08-25 11:30:47.19862
56	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	f0a524f4c7136cfd1b1259b5588a93b1c3f5639b1f7f20552ec125b2d755e8ad	109553	updated	2025-08-25 11:30:47.200102
57	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	75d3b177a2d81d121848a0d0179220eda740948f9df8790960b19037712e0ce2	101639	updated	2025-08-25 11:30:47.201439
58	NOTAS MONITOREO 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/NOTAS MONITOREO 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	9b6adfbdba81b54507f17aadaeaa20480084fcff12cfc2fdeb1d0b04f36cdd40	753027	updated	2025-08-25 11:30:47.204302
59	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	528fbd794a3501258533eb1ec5b8c5507ad46113c55658db29df2c4753bdc6a8	1020228	updated	2025-08-25 11:30:47.20641
40	2021%20ADMINISTRACION%20DE%20PERSONAL.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20ADMINISTRACION%20DE%20PERSONAL.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	5b55b66696a6d6ee601dcc2622db9acf3f0b54d7aa75827ae361190d7f0bd802	648650	updated	2025-08-25 11:30:47.168383
49	Resolución 79_2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Resolución 79_2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	d9017c1330bd1b3e7f4dde5211a6e64cc9f4716c6da76f34f5a910169004b44d	109114	updated	2025-08-25 11:30:47.186973
42	2021%20REPORTES%20DE%20CIUDADANOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20REPORTES%20DE%20CIUDADANOS.pdf	Reportes e Informes	statistical_report	2021	\N	\N	PDF processing not available	cabd20aa79b89d86232624254d4d6074feb29f3b3c1882262b668e1a4066e124	565999	updated	2025-08-25 11:30:47.172903
43	2021%20ESTADISTICAS%20MONITOREO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20ESTADISTICAS%20MONITOREO.pdf	Reportes e Informes	statistical_report	2021	\N	\N	PDF processing not available	c155afa123e06908002afb9389163f7ee9853bf010f5f63197909933afc2c23d	530385	updated	2025-08-25 11:30:47.175206
44	PRODUCCION 2012-2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/PRODUCCION 2012-2021.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	c2d5d451edcc9b9b8489dfe4ca9dda865a3079d169740b996896404f6b357a5f	603445	updated	2025-08-25 11:30:47.177105
45	SIEMBRA 2012-2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/SIEMBRA 2012-2021.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	2ac4b852215574ed554b523d4f32ea781772aac05a119e35d2a1acc2ba9692c6	606033	updated	2025-08-25 11:30:47.178979
46	2021%20BASE%20DE%20DATOS%20NIÑEZ%20Y%20ADOLESCENCIA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20BASE%20DE%20DATOS%20NIÑEZ%20Y%20ADOLESCENCIA.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	ed0334d6deedc783aaab543433d258d2e31afe9be01dd25985e1ff48131c5cd1	525690	updated	2025-08-25 11:30:47.18124
47	2021%20INDICES%20DE%20EDUCACION.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20INDICES%20DE%20EDUCACION.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	ead9d3efb9ac39042e2311282a17fd2f5dde6a01c5bf9d13d9f5bdb375b580bd	566161	updated	2025-08-25 11:30:47.183108
50	SERVICIOS PUBLICOS 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/SERVICIOS PUBLICOS 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	2081dbacfcfcefaa5ce8e0db05fb6842da7fcaeec063a51a79177c8b85ef8e84	650179	updated	2025-08-25 11:30:47.189151
41	2021%20SEGURIDAD%20URBANA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/2021%20SEGURIDAD%20URBANA.pdf	Documentos Generales	general_document	2021	\N	\N	PDF processing not available	0e2b006c1dc65b37157db3969285fef4325da9f439af7371aec9e06cf38af2be	577183	updated	2025-08-25 11:30:47.170411
63	CAIF-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/CAIF-1.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	6735bd3efa3db040d9784e40b9d4468dd4429448a0c5a1629555ffd131343ec2	93387	updated	2025-08-25 11:30:47.212686
64	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	465dae3e768f713c360ed1857ea1f97b9c74d78dc32ad7ce8b603f7dbffc2432	109812	updated	2025-08-25 11:30:47.214407
65	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	ee8a3c2aab89ba62d573850e6f715dbe8b5ee37aae7d426c7ce7a4acfc21286f	101071	updated	2025-08-25 11:30:47.216092
66	MONITOREO 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/MONITOREO 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	5e6edfcfe57f81f9e55ed90cbdd8724373d172f2b7d35d20ee472c746d0dccde	665737	updated	2025-08-25 11:30:47.217954
67	CAIF-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/CAIF-2.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	d380dbf7efdb9a5a4588b5219f8e1d406e7c071fc065291e6082430d932a9222	93906	updated	2025-08-25 11:30:47.219556
38	ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2021/ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	Ejecución Presupuestaria	budget_execution	2021	\N	\N	PDF processing not available	9184981528eaf7b5a7f90ddc786d9accf7ca755ec0b7222cf5b75503e5b3ea6d	115864	updated	2025-08-25 11:30:47.16473
69	SEGURIDAD URBANA 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/SEGURIDAD URBANA 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	3458f211f4f3b1e2407b974d11ea73b961665030bfe2fbf6804eeec31e7482e3	711439	updated	2025-08-25 11:30:47.223877
62	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	338d773bec757011ebdeeee0a9d987cf14275d21857ff23258d64f54d2f1233b	66180	updated	2025-08-25 11:30:47.211292
71	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	4306f1e488451b31f7ac5ba558f7a57b2cd9eca3574565da7cd29e37fb308eea	67548	updated	2025-08-25 11:30:47.227237
72	CAIF-3°TRI-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/CAIF-3°TRI-2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	b2f1065cd808e3c5f182c4e73b5d4c8d30f33db65ff87da4df8ed6af911688f6	94144	updated	2025-08-25 11:30:47.228618
73	ESTADO-DE-EJECUCION-DE-GASTOS-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	0cc6ea42fda7e0c6041a038039d5e1bdb84985d403becb64e5c6fcdf7d12ec20	1299495	updated	2025-08-25 11:30:47.231132
74	ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf	Reportes e Informes	statistical_report	2022	\N	\N	PDF processing not available	279215aea1f65e9adb380dbbf1734b5179174793616f77bd9fd8bae47b5d6011	606072	updated	2025-08-25 11:30:47.233136
75	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	4afedf8d7291e59f7742bef43e9aacd1dd0b576f7e87433692a27cebcb45eb64	85022	updated	2025-08-25 11:30:47.234248
19	SITUACION-ECONOMICA-FINANCIERA-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/SITUACION-ECONOMICA-FINANCIERA-4°TRE-2022.pdf	Documentos Generales	general_document	2020	\N	\N	PDF processing not available	d8bfffdd6c9c62b59142839b09aba07e0782b3e00aaeb8b7c3628033e9d5e72a	88878	updated	2025-08-25 11:30:47.049567
77	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	d9b36f698de47088acceabc761fdb22cf53b53e2e9623d857f983716ac0406e1	924921	updated	2025-08-25 11:30:47.237527
70	REPORTES CIUDADANOS 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/REPORTES CIUDADANOS 2022.pdf	Reportes e Informes	statistical_report	2022	\N	\N	PDF processing not available	1f10662384326e6d69750dcbcedf6c1ea5c7f66dcd7f9517df56aa5230bbb359	491568	updated	2025-08-25 11:30:47.22579
79	Resolución 747_2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Resolución 747_2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	689ca7f746c4ba31929f2d8ac087b31efd42984a9706b53cd80924b82b1ba746	111960	updated	2025-08-25 11:30:47.240479
80	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	f201f0fd100485241cf4933c842bdd0ee5bd010b07269ffd08adc3d29dd26769	85712	updated	2025-08-25 11:30:47.242297
61	ESTADO-DE-EJECUCION-DE-RECURSOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	1fdbe0cea50eaf6e9be1db520f63d5b8572573dea8dce55e25966902515bb958	151544	updated	2025-08-25 11:30:47.209662
78	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	787feaa0bb2b433eb2af8f63287ed3216a4803ff880a01ffd9cffe55e51cacb3	118244	updated	2025-08-25 11:30:47.239004
92	HABILITACIONES MUNICIPALES 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/HABILITACIONES MUNICIPALES 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	0d367d31fdd9a0574bb712819b5d8a631df7e2a189fada505c2b6c68a0a30602	548917	updated	2025-08-25 11:30:47.262716
83	SITUACION-ECONOMICA-FINANCIERA-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/SITUACION-ECONOMICA-FINANCIERA-1.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	d53d9da0a37c71f6172da64f9916d937791985b50ecb99c1596e61e0f53f2c2a	72005	updated	2025-08-25 11:30:47.247791
84	ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRI-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRI-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	ab419cf2f9b6fe30ff65392bb507d7cfb06d011a4f3fb09ea2db4bccd89134a6	85366	updated	2025-08-25 11:30:47.249134
85	ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRI-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADOS-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRI-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	8d6f28cf74b7e254ec84956826a51851b18292014d6a3f95a4c5007dddf509cd	102876	updated	2025-08-25 11:30:47.250478
86	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	52df63981063e70a4f4f90e8b7fa6c27c9ddf5ba74d32e3e1629dd6c6d5c7794	102105	updated	2025-08-25 11:30:47.25198
87	ESTADO-DE-EJECUCION-DE-GASTOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	2c484fe3d6da30036b0bc2f57be03943a38cea6a8cf9b4e783aca3e0341f2962	1173473	updated	2025-08-25 11:30:47.25416
88	ESTADO-DE-EJECUCION-DE-RECURSOS-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	37b9eaddabafb660035df5a322a84523cda4f5d34f60a3ff6fa7d4363e199b6b	141931	updated	2025-08-25 11:30:47.255655
81	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	4f9f36eb2fa279a17e70f5ce1758fe0ffa5eba1b3e46b1e0d096becf6d44c6a6	85431	updated	2025-08-25 11:30:47.244438
82	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	2562daf72188e99d71d772724554149503fb8455827b8b55d9101461e6e1bed7	922577	updated	2025-08-25 11:30:47.246274
93	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	7204f82ac99b0cbc94d6f6d3181968b9f06c96c9d2ce56f4077d906d1d71c01b	102506	updated	2025-08-25 11:30:47.264349
95	ESTADO-DE-EJECUCION-DE-GASTOS-3°TRI-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRI-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	369b875462e5b7903925b02d4f09898e52b5a65b07a31bc4d663d5286466a450	1157656	updated	2025-08-25 11:30:47.267876
96	CAIF-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/CAIF-4°TRE-2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	9bba3d1a9d402a22e85e028162d09e5f846e8a7201c4ea5a8eb9fd0a3922ce5c	93600	updated	2025-08-25 11:30:47.270005
97	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	a841f43fbcd9b851ee884dedfd2e9381bb4166c4dea34a30b1f3d5e2cf14e624	109662	updated	2025-08-25 11:30:47.271319
98	OMIC 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/OMIC 2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	7f43580c7cf5c71baf063f56b12b84d3b2c51577b0b3d40bc868984425c64986	606304	updated	2025-08-25 11:30:47.274637
99	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	b587c3d0c2d04c7d629795390b7e350438639686d9c63d05e3d44337a7efafe6	121409	updated	2025-08-25 11:30:47.275846
100	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-1.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-1.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	8ba792ed7ac608e72188d3c9d9d8279636f1d6be6b255212fcf241c4809a4a49	102839	updated	2025-08-25 11:30:47.277087
89	ESTADOS-DE-EJECUCION-DE-RECURSOS-3°TRI-2022 copy.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADOS-DE-EJECUCION-DE-RECURSOS-3°TRI-2022 copy.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	c401cfabe62f7406b74d761f36122ff31dbda494e474f4f87b66427d44712c14	142229	updated	2025-08-25 11:30:47.257295
90	ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	8bf8fc908041f32b11fb7ed8732ecd5083042b9c30229de81b6f90b39cba5a26	147280	updated	2025-08-25 11:30:47.259685
91	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-4°TRE-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-4°TRE-2022.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	5543a0b6883b62e2d8ee6250e6caa93a33644da29a19a8f705dd718d4cf959f0	67723	updated	2025-08-25 11:30:47.260972
108	GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	4125c24fb06ed2d26e492e84c25a838ec6c3cf0e9326d49c02c8b9baf7178181	277260	updated	2025-08-25 11:30:47.291321
110	SUELDOS-MAYO-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-MAYO-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	c0527043855b3ac643bffca66386fa767acea85df33b253225bd13438182d6ab	426361	updated	2025-08-25 11:30:47.295317
111	Resolución 1691_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 1691_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	d0705b08bd3ae42179040e06a1a062207f2db69fe2a27ed8756d2f2165ec01f1	109934	updated	2025-08-25 11:30:47.297673
112	Resolución 828_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 828_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	0844d9d6eca2d368ce60882b1ddbcda941dbf5a0480344a5371558fccdb89176	113189	updated	2025-08-25 11:30:47.299625
113	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	1d993b326aa0b8c74e0021bfe79bfb0afa4c86cfc201249813ac706553598aa8	85219	updated	2025-08-25 11:30:47.302181
114	SUELDOS-JULIO-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-JULIO-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	8faf1bf409d47260ea562b4ee642a990bde54681687703a62ee9e2e930023bcd	423892	updated	2025-08-25 11:30:47.304956
115	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	8ce37262f32bc87d683b2ae8a39ca0093ee42d40452a8ca9070a418a14a3193d	966410	updated	2025-08-25 11:30:47.308103
116	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	5872165b737a1ebe62afb3b4ddb55bab58aae7d10e89d9c2c05cbecbe270c1dd	102641	updated	2025-08-25 11:30:47.309406
117	ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	c46dd8876a0dbd8b1f9e6ed92b3bd1172709988be1046ed3914c437d5b83c8d6	1164653	updated	2025-08-25 11:30:47.311586
118	EJECUCION-PRESUPUESTARIA-DE-RECURSOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/EJECUCION-PRESUPUESTARIA-DE-RECURSOS.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	484ea7e10649585b0a82866c012b1feb58dace2d5f68067464e53cc01a384993	469905	updated	2025-08-25 11:30:47.313415
119	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	7ae065cb66d61c6942d686e332cc25f3921fcfc3cf00410644d24bfa93de5163	67534	updated	2025-08-25 11:30:47.314737
120	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	416435286e2fce23b88d6d6be16e6cefff650ad3d90c72328f2b8ddd49493497	967123	updated	2025-08-25 11:30:47.316525
121	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	0ac5b5091f01ddc827b061b3f414ed2aec1d3f408d747d04ebf6bbed7785168d	102727	updated	2025-08-25 11:30:47.317721
102	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO.pdf	Ejecución Presupuestaria	budget_execution	2022	\N	\N	PDF processing not available	308daa7e179baedd867e9fd32cc73d3695082b17b4019e0280f363e3a7a0ac76	102664	updated	2025-08-25 11:30:47.279574
106	ESTADO-DE-EJECUCION-DE-GASTOS-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	768a6e2c33e6632c7fc156cf975bb86dc1480c5bcc28381ab8c56290cedbed66	1172209	updated	2025-08-25 11:30:47.287454
104	Resolución 1279_2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Resolución 1279_2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	0dc41aaa44903107d162f6858f8ed992e8defd1f69fae5572923ebe1219e4484	113348	updated	2025-08-25 11:30:47.283544
107	LICITACION-PUBLICA-N°10.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/LICITACION-PUBLICA-N°10.pdf	Licitaciones y Contratos	public_tender	2023	\N	\N	PDF processing not available	9e3a6c534f421d24ca521a122e99b139fab7e1be7801dc2ae0367541ad9236ab	722391	updated	2025-08-25 11:30:47.28965
103	ESTADISTICAS CAPS 2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/ESTADISTICAS CAPS 2022.pdf	Reportes e Informes	statistical_report	2022	\N	\N	PDF processing not available	8e13b9f3cc8367ad7ce10d26f03cf231eef79fcb368b735e00fff102d220b6c7	709359	updated	2025-08-25 11:30:47.28138
125	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	46e3161758ab366576a2e38d58389174e0545d9f694d088768901d32fa3b8969	102665	updated	2025-08-25 11:30:47.32394
126	SUELDOS-JUNIO-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-JUNIO-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	3c0ed2f6f40d32581632d1296b81b85e63f37bc55e03a3cc8708bff25f533f35	423887	updated	2025-08-25 11:30:47.326654
127	ESTADO-DE-EJECUCION-DE-RECURSOS-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	648e058f6e2b4fd2cf13fc7615e2d81d487f521590c091be4f225f9bf72604d3	143218	updated	2025-08-25 11:30:47.328128
128	SUELDOS-ENERO-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-ENERO-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	f46bb8822a5cdb21086d5302960ec071ff71699003041a05e5c202c69eaa3e70	423903	updated	2025-08-25 11:30:47.330521
129	CAIF-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/CAIF-3°TRIMESTRE.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	d258fe4597c35958825d561616a051dba40160fb611911a4b6803165454db305	94706	updated	2025-08-25 11:30:47.33193
130	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	c79cc06ec688d509a4123f46bba8a8fa7fe02a31c9920546784b05eeceb03ead	69801	updated	2025-08-25 11:30:47.333398
131	GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/GASTOS-POR-FINALIDAD-Y-FUNCION.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	c316164553920b51cb7afbf9009320e54e0ab8f9099161fd9756cff634ce77d2	387375	updated	2025-08-25 11:30:47.334837
132	ESTADO-DE-EJECUCION-DE-RECURSOS-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	d35c0fe49cbad094849e10a91fa3865e39b35b10730bd9b8ebdeaf461151a50e	140098	updated	2025-08-25 11:30:47.336188
133	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	c785170fd84deba5735fd324a078a5123e5d4cc46ba6c98b43376d47e2531ba2	85386	updated	2025-08-25 11:30:47.338451
134	RECURSOS-AFECTADOS-VS-GASTOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/RECURSOS-AFECTADOS-VS-GASTOS.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	a42a846701bd9b1fada50f7351a590596831f163444b64d85e189bc2b2e4426d	419672	updated	2025-08-25 11:30:47.34004
135	LICITACION-PUBLICA-N°7.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/LICITACION-PUBLICA-N°7.pdf	Licitaciones y Contratos	public_tender	2023	\N	\N	PDF processing not available	aca9bfcacb7eb305dd650b9b28a206362f0b027e1ff9a3f135c3b380ab42291e	808836	updated	2025-08-25 11:30:47.34185
136	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	2db8629dcbf32354177d38d0a07f390dcb9394dc89d0fd8a9557518be40493c1	109758	updated	2025-08-25 11:30:47.343788
137	CAIF-3.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/CAIF-3.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	8ce662a554934cae3312ff292e93cc5940903a5f6aaaebaa4088019c136e35c2	93841	updated	2025-08-25 11:30:47.345029
138	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	d4ad8d5154f9246807e8883b107f9e35d6ede6335645958e37c7c6707d6760b6	99892	updated	2025-08-25 11:30:47.346229
139	EJECUCION-DE-GASTOS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/EJECUCION-DE-GASTOS.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	48a89dad650dceff484c10889816bd424cda0e716b3cb6a37ffc2564cd37759c	2036729	updated	2025-08-25 11:30:47.348874
140	ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	6eadd93f417a8684d61295ae1ba1e3a3cb37c7c19d24a0f8b17e4c3de36161d7	1152329	updated	2025-08-25 11:30:47.351227
141	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	53306e1153884c66096ca0005169d07ed9c417121d54321ad16e3e33a505cb96	101956	updated	2025-08-25 11:30:47.352974
142	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	e00625e929b2d148c98e02f8fd0d697d5034e19be5555349e7931902c21d5b6c	125901	updated	2025-08-25 11:30:47.354302
479	Decreto 3105_1994.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Decreto 3105_1994.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	f9e205fe892462d06e82f61cd55f78cfbc03231838bc4d2941462c39e6cb2aaa	1464873	updated	2025-08-25 11:30:48.379429
123	GASTOS-POR-CARACTER-ECONOMICO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/GASTOS-POR-CARACTER-ECONOMICO.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	fb7b94568fa136064c9d70c419494a6c7a11e8aa4256814bd7d4e3a6de0fd610	399044	updated	2025-08-25 11:30:47.320734
124	SITUACION-ECONOMICO-FINANCIERA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SITUACION-ECONOMICO-FINANCIERA.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	1c3648564ea79e7485c21ac60d9e6e53a8d08c42af24a8550b9a0eb1f381cbb5	227255	updated	2025-08-25 11:30:47.322514
146	LICITACION-PUBLICA-N°8.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/LICITACION-PUBLICA-N°8.pdf	Licitaciones y Contratos	public_tender	2023	\N	\N	PDF processing not available	a2f62b95099ab076e4ff621ab5d14bc649738ec70de0831ca9f3be7bff9cf59b	809403	updated	2025-08-25 11:30:47.360999
147	SUELDOS-SEPTIEMBRE-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-SEPTIEMBRE-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	5a6458a5ebc89489f7749cd110053a19a4060b9c4f7b13cf6a01b03325f5f379	428996	updated	2025-08-25 11:30:47.363468
148	LICITACION-PUBLICA-N°9.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/LICITACION-PUBLICA-N°9.pdf	Licitaciones y Contratos	public_tender	2023	\N	\N	PDF processing not available	e625b3186807e104214e98dfc2532cf328ae8c476f85de4900a32e0b842797aa	735593	updated	2025-08-25 11:30:47.366498
149	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	f837693724d91e940ede9c6ce0b1b40691777fdebad4af1a8636d0cb2117c4f2	119224	updated	2025-08-25 11:30:47.367987
150	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	959fceaf31f6099c232ed8a63ec71e7b7334dc61ba0284d3315fff19c6240304	923042	updated	2025-08-25 11:30:47.36984
151	RECURSOS-POR-CARACTER-ECONOMICO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/RECURSOS-POR-CARACTER-ECONOMICO.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	a2b146cf1771a4275971cf42a256bc9b789758698fba361d74829531a2209cde	389290	updated	2025-08-25 11:30:47.372336
152	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	3d259a10eebff6b80812be1ae92ae7122f2b1e6036e4c8b0450278cf526eda6d	84880	updated	2025-08-25 11:30:47.373625
153	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	4e83b6de075c5ac255c48f0f04244fb9a86cadb421617d68c688590c7fbc660c	111422	updated	2025-08-25 11:30:47.374811
154	Resolución 297_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 297_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	c1c78d253f20c91afbd5ef6866610c67d5d92badcdc49792e90b1c7a2eb1029d	109873	updated	2025-08-25 11:30:47.375962
155	SITUACION-ECONOMICA-FINANCIERA-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SITUACION-ECONOMICA-FINANCIERA-2.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	57d5e4fbca388e26460809c7acf2a66dc5b4d79d336b07a82aa147ee47b2c0ed	72410	updated	2025-08-25 11:30:47.377157
156	ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	f7d12a5f4353fe34d27bc2c879a1caad55d8ab8f5b2ae7fde7d867f8e69b5257	119668	updated	2025-08-25 11:30:47.37835
157	ESTADO-DE-EJECUCION-DE-RECURSOS-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	7232b7070585c0069593be5ac4c0ca503144c30f4df83cc325c148b43ddb81e7	154286	updated	2025-08-25 11:30:47.380485
158	GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	5802a647d25c987455122e3d53d7ceb57278eea36756f78ae08cec038e3ea1fd	307185	updated	2025-08-25 11:30:47.382177
159	Resolución 1556_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 1556_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	d2488a7e14125b45d2370a3ce06630c1af61db2aa7adfba7dd155609061be85b	118826	updated	2025-08-25 11:30:47.383562
160	CAIF.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/CAIF.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	fd53ce92941ee2ab4d29463bd9fd305c99752eca4e87b5d170d6f2ad010f8fe3	374238	updated	2025-08-25 11:30:47.386474
161	SUELDOS-MARZO-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SUELDOS-MARZO-2023.pdf	Información Salarial	salary_report	2023	\N	\N	PDF processing not available	f375c75e5ccfa6deece76e54f07212adb9c8590222716f386ee694e643b3fffc	424532	updated	2025-08-25 11:30:47.389487
162	ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	910a81f6b53cc206be09d5f109d8246393d29e093cbdfa98621f4435b77a49e7	87336	updated	2025-08-25 11:30:47.391185
163	Resolución 790_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 790_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	a562a8a6e2a908fc2d83790b66c231c02057269909758373eba74e6e441b1cf2	111032	updated	2025-08-25 11:30:47.392497
144	Resolución 3016_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 3016_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	19b40c8d9f088b7b841920f1ea7db8ebe3c94fb3341c42f3045b6a67b00c9f7c	110132	updated	2025-08-25 11:30:47.357992
145	ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	782401fa254feb8ddb2873cd0e5de1ab9a821bf07164a1f30aaafe72b1bc1323	114620	updated	2025-08-25 11:30:47.359324
173	Estado-de-Ejecucion-de-Recursos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	9dc5180c8321b1fceb8c9df4956c32cc2c5f19a37c968e8d80d08c4849c7a76e	464068	updated	2025-08-25 11:30:47.433248
175	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	54924fb94e4ca7432e34311a62a0e6b8f0d45d3f4488146d42e5e119cd1e573d	398461	updated	2025-08-25 11:30:47.439933
166	Resolución 1536_2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Resolución 1536_2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	7ce2540c02c67ca1d3df2028522c155a09dbd003efb4ee6be2d729cb3b5847be	109640	updated	2025-08-25 11:30:47.396998
168	RECURSOS-POR-PROCEDENCIA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/RECURSOS-POR-PROCEDENCIA.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	6a7ceab2efb87ac1518f96e1238e0a1c2e0b6f2810696f7151cf8fd4e9341a5e	362991	updated	2025-08-25 11:30:47.400285
170	MODULO-FISCAL_1.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/MODULO-FISCAL_1.xlsx	Documentos Generales	general_document	2023	\N	\N	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                \n1                                                                              4to Trimestre 2023                                             1er Trimestre 2024                             	fe57d7064f806964ece7f57a6ad9b230cfafac18e503c843cf7a3bfd8bc3b54c	14412	updated	2025-08-25 11:30:47.426272
171	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	e4f48d0c2926a7e5457a68722f1d7af287e80dbd4171f13b1348ea1bab2e445c	294922	updated	2025-08-25 11:30:47.429661
167	ESTADO-DE-EJECUCION-DE-GASTOS-POR-PERSPECTIVA-DE-GENERO-4°TRIMESTRE-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-PERSPECTIVA-DE-GENERO-4°TRIMESTRE-2023.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	2e1515de2cf28604adb6fe79f62661c5166ae492f90620eca3c9491ac5e425b5	85281	updated	2025-08-25 11:30:47.398786
164	ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-2.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	0234d274672c198ae963fe47dbacce1e8b02095e7ad63da982b855a64557ebd7	101611	updated	2025-08-25 11:30:47.393622
165	SITUACION-ECONOMICA-FINANCIERA-4°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/SITUACION-ECONOMICA-FINANCIERA-4°TRIMESTRE.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	2ba47d2c3b626473b13de82698d87d76cfc91e69e8e174ea87c7b75e24fa331e	89080	updated	2025-08-25 11:30:47.394984
176	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	2d9df7a81196bce0e5a48dc2381d0e8cbd51ceee73a7b6951f2222915ea88752	388038	updated	2025-08-25 11:30:47.442242
177	Estado-de-Ejecucion-de-Gastos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	874761519e04b458479a032f31860458ae9ab38253c5f241f9a9d0067b20ff2f	1967737	updated	2025-08-25 11:30:47.445226
197	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	f7fa8bd469c38fbbad04da87180fda46923f820f7e9ed894ce1e78a27826a4b2	399307	updated	2025-08-25 11:30:47.486367
172	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-4toTrimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-4toTrimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	fda863c9e4742fc63d121bb8c6f67a75ffb678697ce46924bb933e60ad8ea1f4	417054	updated	2025-08-25 11:30:47.431459
174	Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 62_2024 de la Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Sistema de Información Normativa y Documental Malvinas Argentinas - Disposición 62_2024 de la Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	43a6c38f46a6c30f7bcbaf2172f69562672e604bf4c747089e343ebb372db1f6	962920	updated	2025-08-25 11:30:47.436893
181	Situacion-Economico-Financiera-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Situacion-Economico-Financiera-Junio.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	c96a1ed230645586c5ebd285fcc0b835423a7c2aa4f9e41b2a00aad9a22e9211	224328	updated	2025-08-25 11:30:47.454251
186	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	1bc732bc7316a4f5b6a0e6ec2681d32feee67584dbb15d65e7e3c771265e0b6f	276006	updated	2025-08-25 11:30:47.463478
184	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	a46fadb9a16c7866650739fef3d1e134284c773140b08a697b3742288d8833d2	387766	updated	2025-08-25 11:30:47.460079
188	Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	c58c3d1ea333b33b46e2edcf62505b8c3a48ac08e62b5074fae2d71495edca9d	2137158	updated	2025-08-25 11:30:47.46801
189	Resolución 867_2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Resolución 867_2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	816a62ef77df9f37e9b056048f2accbfd8a9bbe0f270f224912ce61818ed6bfe	116656	updated	2025-08-25 11:30:47.469513
190	Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	f1bd5e531456c1c410b0ac930e6e4d7844002492396a9289f00612ac865432f5	370357	updated	2025-08-25 11:30:47.471175
191	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	98e5962fbcbff54a4a024af8e10d8824bf3c3eda4f3db12e7b99c57a0b6704d4	418941	updated	2025-08-25 11:30:47.472906
193	Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	36443068ed8efb243ff4c0bee2ec5ea067f5243bb802265fd9d2edc3d7c24f7d	374659	updated	2025-08-25 11:30:47.477138
192	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	9f5b362cd36885d3393367bb8174fee985a46a490fda5d08c872c7018d74d846	413246	updated	2025-08-25 11:30:47.474568
196	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	1975b3e4209305619faa51e203189e44332de41e25bde4802756d06e2f730a10	963545	updated	2025-08-25 11:30:47.484218
195	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	9ca20572c11d3a60741b778f76c5e6288ad288211ed403f80d97b92cfd3907da	362628	updated	2025-08-25 11:30:47.48075
180	ESCALA-SALARIAL-OCTUBRE-2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/ESCALA-SALARIAL-OCTUBRE-2024.pdf	Información Salarial	salary_report	2024	\N	\N	PDF processing not available	012eb13ac4865f3b77360ea43210993993ff7b3c7bce8afb3c9a3c4673656d55	434499	updated	2025-08-25 11:30:47.452419
179	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	b8fd4047379f92c5f3249af079f979c2de83a26c8b3755bbb4bf6ec887b783aa	361665	updated	2025-08-25 11:30:47.450444
182	Estado-de-Ejecucion-de-Recursos-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	eff7a700920e8703d48ecc299217d82974c3eb6bea3fafd5f985e9883ebbc3bd	471919	updated	2025-08-25 11:30:47.45605
183	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	e7095588496ac652cb708e7e33fde4ba5fabd41a996f78f051c535b0bd38defd	388869	updated	2025-08-25 11:30:47.457977
185	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	e2ddf5be5abcecdbc8e2ec509decfdace401249b01571cd8ab1b75935e1c030b	275027	updated	2025-08-25 11:30:47.461762
187	Resolución 539_2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Resolución 539_2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	c9a1fb1167829aef4417626cb278f872c1f33c563ebf04be6e3f299ce2c14851	122360	updated	2025-08-25 11:30:47.465161
194	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	9a125a073c60037d839bdf096937614e895c2767e9fe7ca263cf6940210e5117	294013	updated	2025-08-25 11:30:47.478776
203	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	c598acc527f92993ade1139a24c3fe9b668be66dbaa672d390240dce826c45dc	278896	updated	2025-08-25 11:30:47.501423
204	Disposición 62_2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Disposición 62_2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	71f31661ac2497704d036d0f281afd25326c2a5d5f42dda9f3df087d37ae991a	121670	updated	2025-08-25 11:30:47.503557
206	Situacion-Economico-Financiera-3er-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Situacion-Economico-Financiera-3er-Trimestre.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	f5cc5695ee5713a00ad14c54c1326fe47bb9fa18d32ae4c0495ca7cda9aec247	226061	updated	2025-08-25 11:30:47.506857
205	Estado-de-Ejecucion-de-Recursos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	5cb7f6ef63b9f6e1d18e5f0e53915548744f21e4884a2f192a0cf0342c5e3943	470734	updated	2025-08-25 11:30:47.505322
208	Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	e4b824630ee51b686514fea747b6df223672ac25c44bad7eb15f326524188a73	362364	updated	2025-08-25 11:30:47.511943
209	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	726165a5adace0ed7efa3cd43e2139b7ffca5978a95dd3de34eb08bc8ff384a0	400441	updated	2025-08-25 11:30:47.514155
211	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	b70186be3673a7c4e430ddde4372c9b4fd1ecfb9604679caa59f849e1028de84	389471	updated	2025-08-25 11:30:47.517769
210	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	32b51dd36b8b5ddeefa9aeb2ea64acbccb1d2b17c32d8aafa5fd4a5a09be80d5	294085	updated	2025-08-25 11:30:47.516111
213	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	c643e42fe0944fcd50e3426cc1a313f271a82f77bc341fdc39f8c43d8c34acf6	922622	updated	2025-08-25 11:30:47.522447
214	Resolución 2623_2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Resolución 2623_2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	9284181234d2751256cefc778fe3065add1bb266eaa07b2ba9f9ad931a976aa6	111987	updated	2025-08-25 11:30:47.524339
216	Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	8647e5d72e97edc7a074f407068cd09ec5106f222c92bf49a953a92945dd4204	2071972	updated	2025-08-25 11:30:47.529664
215	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	57699ba7d54424c6b83dfe5a15d0c9fe1b4ddd21ca0cb66e6e92d207fc06f5b4	418582	updated	2025-08-25 11:30:47.526568
201	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	ea08cbab669263a858d3ea1d2d9cee8402e7f54db42d6e12ea91e87ffaeed19b	295227	updated	2025-08-25 11:30:47.497762
199	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	23eafa7a8105c46da2d3e1974e7b96032bb4fbac3ca133acf8744a4d517f1e86	389286	updated	2025-08-25 11:30:47.490213
200	Estado-de-Ejecucion-de-Gastos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	ceda375dcda211334b1d037ac60ed1c8d11d8f4a4f44578be523e59330d1084a	1801842	updated	2025-08-25 11:30:47.495171
202	Estado-de-Ejecucion-de-Recursos-4toTrimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-4toTrimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	ba7910ad37105ad86dcb852d9c6f4f8db59316643ed92ed33e818d16fda94800	471414	updated	2025-08-25 11:30:47.499823
207	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	1c53ae8c000b795f35af498d6182111a5983ca4ae0c2c3174b1629d8d05cbab7	386959	updated	2025-08-25 11:30:47.509726
212	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	d5fd3315d8aa8d87d999138883ddeb1b44fb2a992a44024bd052b310be45a0e6	386059	updated	2025-08-25 11:30:47.520115
224	Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	a87d6bcd74a1590e6a3627aaa092ec47b077c77b5e45f41e01afad254dd79a49	372895	updated	2025-08-25 11:30:47.563231
225	Situacion-Economico-Financiera-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Situacion-Economico-Financiera-Marzo.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	0b09f42064bf14f39d0a6d51da8d52ad7fb001a63cd3bab7b00d3ba3fafafbe6	224229	updated	2025-08-25 11:30:47.565312
229	CONSULTA-IMPOSITIVA-VIGENTE-.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/CONSULTA-IMPOSITIVA-VIGENTE-.xlsx	Documentos Generales	general_document	2024	3	Enero	=== Ord Imp 3202 Actualizada ===\n    Unnamed: 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Unnamed: 1                                                                                                                                                               Unnamed: 2                                                                                                           Unnamed: 3                                                          	8fabef6454699b8ed67281bbe450aa214e96bbdb544cba1eef9f8e1f07a68e14	57712	updated	2025-08-25 11:30:47.732091
218	ORDENANZA-IMPOSITIVA-3202-24.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/ORDENANZA-IMPOSITIVA-3202-24.pdf	Normativa Legal	legal_document	2024	\N	\N	PDF processing not available	f209255329af8d503eb1749362bd6c96e526f87c37cbc6b806f0bc706696b3c3	22469309	updated	2025-08-25 11:30:47.546928
221	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	b8904e79604fc1affbb1c8c1335b61fe89e2e913124768213d54e0fc2444f4aa	901068	updated	2025-08-25 11:30:47.557642
220	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	34ad4c9be2e64fdc441cabf3b6d6b99017aa9c5cbe3c177deb08139c0b47d9d3	278043	updated	2025-08-25 11:30:47.555792
223	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	960b87afdf19973a49343cec49f9f67590fcd533802c38a4faeb221898efb6de	388402	updated	2025-08-25 11:30:47.560717
217	Resolución 466_2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Resolución 466_2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	285055769f245edd06aeb7be67df1d62f26c4828fded005736c3e83a6bac3e39	106965	updated	2025-08-25 11:30:47.532466
222	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	c704de18642ef3a2cae2e2c324e6603017c5be091ece9c5fbcc95d45775459d0	397512	updated	2025-08-25 11:30:47.559248
226	ESCALAS-SALARIALES-FEBRERO-2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/ESCALAS-SALARIALES-FEBRERO-2024.pdf	Información Salarial	salary_report	2024	\N	\N	PDF processing not available	83f69d35929cdbd40d86a1a07aa219495acb0e58f2c4a8cab3c963413f057a72	428627	updated	2025-08-25 11:30:47.568098
239	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	affa65225aec2163f7efe665d394d61af9ba6b94eac36ef1a7f73df54e023279	361206	updated	2025-08-25 11:30:47.794533
231	STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx	Información de Deuda	debt_report	2024	\N	\N	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6  Unnamed: 7 Unnamed: 8  Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                              \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                           	e86668e34a363985869dd1866ffb500ad37e0f8d3df1dea40fa3b03d7da6a96f	20596	updated	2025-08-25 11:30:47.774773
240	Cuenta-Ahorro-Inversion-Financiamiento-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Cuenta-Ahorro-Inversion-Financiamiento-Junio.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	bc133744d7865c3d09660d96b1ff4503ab179396e384a1c97b8d3cbe0bfe012b	374759	updated	2025-08-25 11:30:47.796171
241	Situacion-Economico-Financiera-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Situacion-Economico-Financiera-Junio.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	4d3cda4a2333195d1d47e54c3a04dfe0d76061cbaa331cfee2101411f43122f1	224374	updated	2025-08-25 11:30:47.797819
244	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	7f09557c268b97bc144b3e35a544b2421a4a83b40581bf3d530ae130f8d2c39c	276458	updated	2025-08-25 11:30:47.804676
235	Disposición 61_2025.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Disposición 61_2025.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	278d22223f611f025f59a0ce83b651390b5fea873afef7d3b3ea068656242935	102264	updated	2025-08-25 11:30:47.785019
243	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	7d3ccddca8fb3b8f31b2b1ed91c46ac8190b3aac4bdaa82647c3b3cb0d8c728f	387930	updated	2025-08-25 11:30:47.802513
236	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	a98757a4754a94ae7451d477641f0939dc0feb3b5bce83c39e30d77d66e7e492	397604	updated	2025-08-25 11:30:47.787019
233	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	ab1883e079bd3e4983c43d78842421dcc9618b8d8449bc5b82a42a3cc64c88a1	287915	updated	2025-08-25 11:30:47.781443
234	Estado-de-Ejecucion-de-Recursos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	be9be7d910fdf7007b93b9941d47fc8f6628574322d1b8148190bbccf2a090a5	459999	updated	2025-08-25 11:30:47.783166
237	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	489697d1ba5e333563e0bbc6abf730f6a502dee94094178fcb1421538ac648e1	387205	updated	2025-08-25 11:30:47.788638
238	Estado-de-Ejecucion-de-Gastos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	4dd94e4bd5eb67186147a9293ed85db13aad6c7cdd9f65f97b5d24f8e912ebe8	1872515	updated	2025-08-25 11:30:47.792749
232	ANEXO-II-ZONAS-IMPOSITIVAS.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/ANEXO-II-ZONAS-IMPOSITIVAS.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	12741d79e70bfaf16beac5f17237fd7f40a313ea312977485a57a9d555512813	312765	updated	2025-08-25 11:30:47.779645
248	Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	657e795cccfca50b79ad49fbc3af921a81c6d399ca7c650afb39ff448b5543d0	388601	updated	2025-08-25 11:30:47.813652
249	Estado-de-Ejecucion-de-Gastos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	302f624762d78290862ec9a15639a8760f18dca7f686cd1113eb12368034c4a3	1777921	updated	2025-08-25 11:30:47.81653
250	Estado-de-Ejecucion-de-Recursos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	cc95c83a6ab8c9fb567755afa0ff9fc941a59c90be2b0faf6620f97b99dc2f5f	463491	updated	2025-08-25 11:30:47.819079
251	Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	37c59f6650444a6e1f8665aa6ba719eb4e24e502d37601bf627614f7e917f517	287416	updated	2025-08-25 11:30:47.821375
252	Situacion-Economico-Financiera-4to-Trimestre.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Situacion-Economico-Financiera-4to-Trimestre.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	f901b71d01b5f721ce6192221f070adb937dabe36a547a20e18047438e5d3350	305831	updated	2025-08-25 11:30:47.82424
253	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	0572c13dab859bf3f85f24c2fe3168147a18cd8bf706013e4a9ed21374de4076	382115	updated	2025-08-25 11:30:47.826774
219	PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf	Presupuesto Municipal	budget	2024	\N	\N	PDF processing not available	98ebd96bc481b194f266de5a2ffd3a146d72e83b2988829ed1e32a0b37fcdc34	9629038	updated	2025-08-25 11:30:47.554129
255	Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	f1bf0d80ec91075182b068899dcefb94bff746ec949a42dce807df523023306a	277186	updated	2025-08-25 11:30:47.837865
247	Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	f1a97a35e5325a2e0139fc0298ff7508650fce19b195dc758feb419b0a8c56a4	397346	updated	2025-08-25 11:30:47.81151
257	ORDENANZA-FISCAL-3198-23.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/ORDENANZA-FISCAL-3198-23.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	190343192cbc94ad53782e434d680c2af566ef165434f40fc5fbc1b4e95655c9	44626056	updated	2025-08-25 11:30:47.867263
256	ORDENANZA-IMPOSITIVA-3282-25.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/ORDENANZA-IMPOSITIVA-3282-25.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	f601cf0523f0610cbb9365867910f872990007932edd9e353111474c2dc73122	2810889	updated	2025-08-25 11:30:47.841277
260	Situacion-Economico-Financiera-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Situacion-Economico-Financiera-Marzo.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	64b8bcc9a2a0bdac9198218bdf82a8bbe207e5b3d1cca01cb1ebf59b664fbfab	225283	updated	2025-08-25 11:30:47.875297
258	Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	6f39b1bf90fdf0b4398b6bc6baf8b556b3ed02ef597e7f798639ea010354f326	387591	updated	2025-08-25 11:30:47.870576
296	FichaProyecto_1003116078_276794.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003116078_276794.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	a15e2f367014e1737c63642d4ea3ba523fe263ecab80545b6a94dd497d948c8c	74293	updated	2025-08-25 11:30:47.993512
259	Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	82d4df351473e9c08b11f20b815d5341258c3af8337ee412c500fc502472c1e1	373199	updated	2025-08-25 11:30:47.872573
298	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3393_1984.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3393_1984.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	11003b62897c2fd71428d3d2763478a0a7dfe2fa1c00be822fc01f3d453013c9	846119	updated	2025-08-25 11:30:47.997307
314	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 269_2011 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 269_2011 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2011	\N	\N	PDF processing not available	8c706d08051a02f06cbb4b3eab30090c9f78f82861e51bacab3d31f3c9e9edb9	893692	updated	2025-08-25 11:30:48.026457
319	DDJJ-2024.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/DDJJ-2024.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	ebe561bcd10f0fb60ed2b7494fa99a489b216dd410b50915614fa103dc53aced	446399	updated	2025-08-25 11:30:48.043277
246	Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	df5587bfd6c7b2257485c89f3c68a55ddd4c5ecd7e7b63656c31085211d49852	362608	updated	2025-08-25 11:30:47.809026
274	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3429_2008.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3429_2008.pdf	Normativa Legal	legal_document	2008	\N	\N	PDF processing not available	2d00ab76d87ac49e418f9743b4d3e82e4daa8effe1eb2f662d82fff137ef5a82	853130	updated	2025-08-25 11:30:47.945484
295	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1903_1992.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1903_1992.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	94e8b67ee4f71b40715fb71e90a50f527fcdebdeda5c220e3eef2d67482ff771	848336	updated	2025-08-25 11:30:47.991847
264	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1453_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1453_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	10234323641540c1513c6eb61a1eea445cf74154098b56cee3ff450ddc517bc6	849561	updated	2025-08-25 11:30:47.917283
265	Anexo3.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo3.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	a8732951394ae8120b18512c8db8dc99e47dd9986ec1864296953ffb48f022b4	910833	updated	2025-08-25 11:30:47.921057
267	Resolución 269_2011.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Resolución 269_2011.pdf	Documentos Generales	general_document	2011	\N	\N	PDF processing not available	3714c5edfbb39e63da452c90b86c05b3277281bcc8ddc0a021180a92194fca4f	72639	updated	2025-08-25 11:30:47.926481
105	LICITACION-PUBLICA-N°11.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/LICITACION-PUBLICA-N°11.pdf	Licitaciones y Contratos	public_tender	2023	\N	\N	PDF processing not available	551ae71a8be9e2903b5988db85ab273f80955ad0bae57613759ea2076085efdd	769278	updated	2025-08-25 11:30:47.285511
276	Anexo2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo2.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	d86c33e797a4d8e49ac942f5e8210a9e7744075b6749b329bae15db883d13dff	130546	updated	2025-08-25 11:30:47.949418
278	FichaProyecto_10013801_668748.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_10013801_668748.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	6a24ee3da553390ddb9ab0e6bba8801c73c34aa59b5c083d05f7d9d4afe2011a	52808	updated	2025-08-25 11:30:47.952737
280	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 105_2016 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 105_2016 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2016	\N	\N	PDF processing not available	8b35b4d460ca61dc4ba3b153527a79464a7e534a7ae25aaa5c14b31b6be9fe0e	872883	updated	2025-08-25 11:30:47.956618
281	Anexo (1).pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo (1).pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	eeb5cf05d426b398f7bbfba214117fb0c3a65ef0c34e01d9f030f9864a449ce7	141225	updated	2025-08-25 11:30:47.959341
282	ddjj-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/ddjj-2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	ab6f961431742891e510b5a5fd37cf6d94318ccc6aa592974628fc8869273776	430957	updated	2025-08-25 11:30:47.961651
285	Decreto-ley 7252_1963.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Decreto-ley 7252_1963.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	48382abd58063d08a4a2650adc59f241ce7778e3140398117d135bb4e6604dd5	87012	updated	2025-08-25 11:30:47.97132
287	SUPERFICIES-SEMBRADAS-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/SUPERFICIES-SEMBRADAS-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	0859adc2f0a1cf696021f6a45168d738414e938f7f4d4c967c7220dd5e5b0e55	460714	updated	2025-08-25 11:30:47.975178
289	ddjj-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/ddjj-2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	1323a47066c17dd9629bac2c8d0ea8b35247a0a8ff093f546aba58ed3c63a438	431004	updated	2025-08-25 11:30:47.979822
109	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	3ee5c2ca8218c9674acbede4fdfb50b8f794b877adc443ef5e307c29f4060f08	901255	updated	2025-08-25 11:30:47.293108
293	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1767_1979.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1767_1979.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	8cbd93cb0e97f26130c25b833c863a2add706e4cead47cfd6fc2c810f0ad52be	844448	updated	2025-08-25 11:30:47.98827
357	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto-ley 7252_1963.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto-ley 7252_1963.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	f40943f0b3ca9a2ce7add095cf9b665b9fa79390c35f9190267f00d890140024	882295	updated	2025-08-25 11:30:48.117947
362	Anexo Único.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo Único.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	3b02dda23651f67d03ed8eddc839743e59ae3ac1be896221c283256dd292119c	81458	updated	2025-08-25 11:30:48.127868
320	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 205_2014 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 205_2014 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2014	\N	\N	PDF processing not available	c30d7b42a70d8e5308b066b7b2c94807ea72e6dbbb648b652db12f4b833eeb19	869728	updated	2025-08-25 11:30:48.045537
321	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 2217_1987.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 2217_1987.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	f53416d6cf8e0630409af57892a3b201edb62bc209334335c4b128de18f6bd72	847434	updated	2025-08-25 11:30:48.047779
322	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4244_1991.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4244_1991.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	b6a41b42596eb7e2d9e4dce7cbc938825022720c2485191191f2955fa5de087e	841506	updated	2025-08-25 11:30:48.049779
328	Anexo .pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo .pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	3aa382608110558ef4bed951adab4b3c736b932427b62437623190e050a9427d	3561909	updated	2025-08-25 11:30:48.064864
331	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 7800_1986.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 7800_1986.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	a7b3392930a6e37ef78af2793a9785486b7283066ca2c35aec8628d504bac3c2	852257	updated	2025-08-25 11:30:48.070128
335	FichaProyecto_1003129479_598814.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003129479_598814.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	0c96bb47e39cfccf03459df30e8c52712d51a2f5d903f7de87479aee085a0439	27372	updated	2025-08-25 11:30:48.076751
336	Sistema de Información Normativa y Documental Malvinas Argentinas - Ley 5991.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Ley 5991.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	d33d53fc4bbeaf6a2a3a2799808d6e9198087efab260eab19e06dc66c6c05ed7	873575	updated	2025-08-25 11:30:48.078627
342	FichaProyecto_10014863_975615.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_10014863_975615.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	5b887596c7b18333a382b6017c51330c261731149ade4972da78f0a81d0720f2	52785	updated	2025-08-25 11:30:48.089289
60	Resolución 1593_2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Resolución 1593_2022.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	9dfa4eedd97cebce4a43518f226b6aae4ea880537d6fdb3bfdcc1b9c5893d8a0	114309	updated	2025-08-25 11:30:47.207679
356	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 7157_1985.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 7157_1985.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	974285ce5c92b45989dc505a3bb6957c23598efba84fcd97bbf65100e5c10e62	845714	updated	2025-08-25 11:30:48.116311
358	D__livecycle_tmp_pdfg-LIVECYCLE01__50_8eb5-1676d4-6ec990-471e3f-487b1a-35d004_File.html.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/D__livecycle_tmp_pdfg-LIVECYCLE01__50_8eb5-1676d4-6ec990-471e3f-487b1a-35d004_File.html.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	086aa8435e8f15e4220b533ef4f7fc2b1e9180cd372aa4a977c48c6838d8d04c	81117	updated	2025-08-25 11:30:48.11935
359	ADMINISTRACION PUBLICA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/ADMINISTRACION PUBLICA.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	1c159d12aa4a12244ed9500fd347bf8e9ecd97480a41dc291b2431a64a5f19b0	649613	updated	2025-08-25 11:30:48.122445
122	CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-4°TRIMESTRE-2023.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-4°TRIMESTRE-2023.pdf	Documentos Generales	general_document	2023	\N	\N	PDF processing not available	d4c4f37676024e09f66f93625a4bceb409149efac314d8c598e6d1746ff940f1	93817	updated	2025-08-25 11:30:47.319022
368	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 87_2012 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 87_2012 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2012	\N	\N	PDF processing not available	566a86ee95a103f8ecc865de6e1444988be2b3d955c531c4c95a3ea112510e34	872358	updated	2025-08-25 11:30:48.139482
381	Ordenanza-Impositiva-3059-2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ordenanza-Impositiva-3059-2021.pdf	Normativa Legal	legal_document	2021	\N	\N	PDF processing not available	23eff22eb1db3407fb77ff8313b87e69da9edef31a879fb0775d440d8dd93044	809293	updated	2025-08-25 11:30:48.167731
434	Ordenanza-Impositiva-3135-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ordenanza-Impositiva-3135-2022.pdf	Normativa Legal	legal_document	2022	\N	\N	PDF processing not available	87299c2e8fd26ee1173ac98ef66eda5207437951acb412bcc05cc51701266e1c	4164541	updated	2025-08-25 11:30:48.289277
400	FichaProyecto_1003124237_625084.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003124237_625084.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	4a7296e39da11a25752ad5a29adab7ca723fc282bfdf872c566987ac42404984	74537	updated	2025-08-25 11:30:48.213102
424	PRODUCCION-AGRICOLA-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/PRODUCCION-AGRICOLA-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	f5d72ea6e7feafdab71df74763470445797b66395cb15ba4a1454ac5a2023ee6	464169	updated	2025-08-25 11:30:48.265739
386	FichaProyecto_1003119678_104370.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003119678_104370.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	1992577756d39fcd8060f673f4bcd2c02772a26393f19aa008f45bad14bd846e	5014998	updated	2025-08-25 11:30:48.181629
392	MapaInversiones Argentina.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/MapaInversiones Argentina.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	816fa55361855ab3594d3356506edd7b4d6702503dae650c1ddc8e990385cf70	1081969	updated	2025-08-25 11:30:48.195035
393	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 815_2007.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 815_2007.pdf	Normativa Legal	legal_document	2007	\N	\N	PDF processing not available	49eb0176f7429a7d705fb027dc24fa45449afcbebfb4a17eade79d776dac49db	847952	updated	2025-08-25 11:30:48.197597
397	Ordenanza-Fiscal-3057-2021.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ordenanza-Fiscal-3057-2021.pdf	Normativa Legal	legal_document	2021	\N	\N	PDF processing not available	168dacd2f10af0ba9fafee14b3422adf38f7a6a37b937b70e4393956f0763787	669986	updated	2025-08-25 11:30:48.207383
245	Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2025/Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos-Marzo.pdf	Ejecución Presupuestaria	budget_execution	2025	\N	\N	PDF processing not available	2f28055c2e1df3b2283f4e23ba6aa875dabeb5a491078bf23b5a106c7ad4b7e9	410450	updated	2025-08-25 11:30:47.806524
403	Ley 5991.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ley 5991.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	38bbd1667c8fc4e549fdefe86e324ec7bfb43830eb1f7a9b9a7398aebc5b1778	41481	updated	2025-08-25 11:30:48.219212
407	STOCK-DE-GANADERIA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/STOCK-DE-GANADERIA.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	9b8dc37eebeae70fb5715ddd359433ac1438063eba2c7baa0707fe5cbf062219	338172	updated	2025-08-25 11:30:48.22675
408	PROYECCION-DE-POBLACION-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/PROYECCION-DE-POBLACION-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	0fd5719964ff1557befd8541e7ca09093f812c215b5e89ebaf599b3d1fb30f54	522905	updated	2025-08-25 11:30:48.228057
339	DJ Boletín Oficial BA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/DJ Boletín Oficial BA.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	e4b9e7d462bfcadc985e088dbf0a5b0454c285a345223c8b6f4c3e0593089648	146616	updated	2025-08-25 11:30:48.084648
198	Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf	Ejecución Presupuestaria	budget_execution	2024	\N	\N	PDF processing not available	ec7ff9715e2076eb615f8a0de37c3d3c4257dbaa7b7f2ee6630b70607950a20d	361491	updated	2025-08-25 11:30:47.488265
454	BROMATOLOGIA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/BROMATOLOGIA.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	25fcba53ab59e72e62bee2d8affbaf91656d2de13aed43cbee29fd0d49942ebf	496846	updated	2025-08-25 11:30:48.326894
460	Anexo  (2).pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo  (2).pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	291ba77d7fc38b397d9c3581efd09229ce16f4f655779a43f67e5372cf500c31	3409782	updated	2025-08-25 11:30:48.342479
462	Informe.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Informe.pdf	Reportes e Informes	statistical_report	2025	\N	\N	PDF processing not available	560af5febb2fbcf88a2b8aea084b44b5a97771804feee49b86826ef5a82528a5	3531432	updated	2025-08-25 11:30:48.349284
470	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1738_2000.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1738_2000.pdf	Normativa Legal	legal_document	2000	\N	\N	PDF processing not available	cb89590f10df388b82c96c98be86d0908c3a8ad27a246cca19b8d33ff7088899	847692	updated	2025-08-25 11:30:48.363399
472	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1228_1989.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1228_1989.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	43d3d4f2ecf815be723e8cd737a8ead7fa081fefa29e772735d7e6547b7cda32	881276	updated	2025-08-25 11:30:48.366743
474	CONSULTAS-DE-LAS-CAPS-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/CONSULTAS-DE-LAS-CAPS-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	02064713ce47703cbc1ed22836ce3570b9431025d8978929bf5f95977cbb3bca	244386	updated	2025-08-25 11:30:48.369358
476	Reporte Completo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Reporte Completo.pdf	Reportes e Informes	statistical_report	2025	\N	\N	PDF processing not available	6c9f10c8493d99b382125d1b83252e586ba2ee44e217503cd1a814e406aceb85	1791193	updated	2025-08-25 11:30:48.373915
483	FichaProyecto_1003115938_983772.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003115938_983772.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	cbcabc00f59bb03434b6f346d6582245fccecd390363d7545f62f291c1d24467	1381568	updated	2025-08-25 11:30:48.387195
484	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3638_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3638_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	782798e4ce5b76337b159f8cca7e81830b4ce8e24afc80631542b683b3029e60	849447	updated	2025-08-25 11:30:48.388962
485	Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	320c91d702f9d2ea2566e01f13415f793d7c258d873cb293cc3ae9abfabb0d82	5771464	updated	2025-08-25 11:30:48.394126
488	Ordenanza-Fiscal-3112-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ordenanza-Fiscal-3112-2022.pdf	Normativa Legal	legal_document	2022	\N	\N	PDF processing not available	75133b68c984caf56e3a9413f48e82640ef569de9d9d4f1fcff72cf9b19b57c1	6002608	updated	2025-08-25 11:30:48.403137
494	SUPERFICIES-COSECHADAS-CARMEN-DE-ARECO.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/SUPERFICIES-COSECHADAS-CARMEN-DE-ARECO.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	ed5829632790e7fd4ce7f55652742d4f11e375ba3a81305051ca5e1d95d4d243	512320	updated	2025-08-25 11:30:48.412381
499	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 223_2016 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 223_2016 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2016	\N	\N	PDF processing not available	61d616e5dc30bd75c991f4298ca0b03ab8b180ce9bb617bc12589b214a65879e	872027	updated	2025-08-25 11:30:48.424733
501	Anexo.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	f756c5b410a999f143484e43a148f969d5a390e6bd8d418ec46261a0743c7849	1321270	updated	2025-08-25 11:30:48.429746
503	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1275_1984.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1275_1984.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	a3e32dd98fc1d9a1b8a2fbb61b3bb99d1e1d95e0e791ca3b02676e40625f86a9	850591	updated	2025-08-25 11:30:48.43301
508	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 2857_1996.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 2857_1996.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	02ca6e87348b599a41c654c98fdfa2a70d0ec7d4ca670607d213a596d11ed06d	851175	updated	2025-08-25 11:30:48.440782
509	Publicación de avisos municipales en el Boletín Oficial BA.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Publicación de avisos municipales en el Boletín Oficial BA.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	06aaf368de10a087b57909910edbbb0d39309b91f1b4bcbdef33142904f00e10	3355283	updated	2025-08-25 11:30:48.445307
512	MapaInversiones Argentina2.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/MapaInversiones Argentina2.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	ab6d0252db4918a746fee51ad04a86867e2bc08fc8745e1e6afbc1d64f752108	3586654	updated	2025-08-25 11:30:48.455014
519	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1768_1979.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1768_1979.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	38078f6aaea08fc5e3ac8630135a4e3af45b0c3c8a8d46aeff5dd18d5b9fb502	847406	updated	2025-08-25 11:30:48.481547
520	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1873_1987.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1873_1987.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	3fd74821c3d898d7a0342ef55edcea56642db60b40bbf8e438e9c2d56ce2720c	850028	updated	2025-08-25 11:30:48.484102
525	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4914_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4914_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	1f6cd061c359fc2c195565917296da17372587f238eaa1b98c52fc8d24b38501	843342	updated	2025-08-25 11:30:48.492803
527	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4915_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 4915_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	ed4de6e23cac32021a2db5f768e9bd44384a91646ee35f740015ea17f3bb2a89	844611	updated	2025-08-25 11:30:48.496528
534	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 950_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 950_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	26f466d9eeef7a458c1b7b30c6c69a5e6070fa76a8e7054d955f791a8fd88501	848952	updated	2025-08-25 11:30:48.525025
536	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 6436_1987.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 6436_1987.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	690418a9a6066d8679b3f5bfeb30072aa32787931260c4e5c603e9bee79efd48	852478	updated	2025-08-25 11:30:48.535005
537	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 29_1998.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 29_1998.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	482f5035734ed7449a8f8104e87807a28304d0b070e104799ce64a1e79d158e3	846757	updated	2025-08-25 11:30:48.539122
28	03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2020.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2020/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2020.xlsx	Información de Deuda	debt_report	2020	\N	\N	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias  Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                   \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                                                 	16248864f54bbc9092b099a91a1bc2bd91927dd865740a254044bbb6a0b001ed	20586	updated	2025-08-25 11:30:47.136416
48	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2022/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf	Documentos Generales	general_document	2022	\N	\N	PDF processing not available	d3871f62ebb077fc69a9bb1a186ed818f6fa40423e694fa5cee3c41c0ea5394e	959558	updated	2025-08-25 11:30:47.185454
178	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf	Documentos Generales	general_document	2024	\N	\N	PDF processing not available	caf4336bbf7b76e62adf3902fb3a7cff47dd376729e1ec44cd08bef5a017c155	930421	updated	2025-08-25 11:30:47.447474
143	ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-3°TRIMESTRE.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-3°TRIMESTRE.pdf	Ejecución Presupuestaria	budget_execution	2023	\N	\N	PDF processing not available	64a8adaf2fdba8238fd84584112eedd31a1b5cec79496fcaef4998d26219b17c	68205	updated	2025-08-25 11:30:47.355636
539	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1228_19892.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 1228_19892.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	501e825350724721eadcd1159d85b04b9274842c382f14cbe73c8a590afb8a66	881276	updated	2025-08-25 11:30:48.547439
541	Ley 7240.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ley 7240.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	8650ea021ea85015e1855e3efeb03075baa779dbb3eadf8d4a8ebea5aaffd4ff	31115	updated	2025-08-25 11:30:48.554885
554	FichaProyecto_1003129342_956064.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003129342_956064.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	5acd808d223dd568eff2a880722f65afb9f09e8dc4c25b13c30e745762e24933	74766	updated	2025-08-25 11:30:48.616961
558	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3360_1999.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3360_1999.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	e65e63e2a473fc6205d2b2d4e679017b66ac407c2a6c05aefd3f57f658fbb306	849260	updated	2025-08-25 11:30:48.624201
561	Ley 7240(1).pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Ley 7240(1).pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	ff5f63b423f9b526b957d76facc64b51e8bac6999b65e741a51f5609ea06c074	78982	updated	2025-08-25 11:30:48.627956
569	Anexo-II-Ordenanza-Impositiva-3135-2022.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Anexo-II-Ordenanza-Impositiva-3135-2022.pdf	Normativa Legal	legal_document	2022	\N	\N	PDF processing not available	50ae7ac4489785557037de874425184c1a309a48e23c91e5a93c8a807b8bac44	684888	updated	2025-08-25 11:30:48.646376
570	FichaProyecto_1003129479_695538.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/FichaProyecto_1003129479_695538.pdf	Documentos Generales	general_document	2025	\N	\N	PDF processing not available	d7e5fe093229b362f6ed07c0a48eca091618d59b9a59cb0f436adf1d51e23eb6	27372	updated	2025-08-25 11:30:48.648153
230	03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2024/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx	Información de Deuda	debt_report	2024	\N	\N	=== Planilla C  ===\n   Unnamed: 0                                                                                                   LEYES Nº 12462 - Nº13295 y modificatorias           Unnamed: 2          Unnamed: 3 Unnamed: 4                          Unnamed: 5 Unnamed: 6 Unnamed: 7 Unnamed: 8 Unnamed: 9 Unnamed: 10 Unnamed: 11 Unnamed: 12 Unnamed: 13 Unnamed: 14 Unnamed: 15 Unnamed: 16 Unnamed: 17\n0                                                                                                                                                                                                                                                                                                                                                                                            \n1                                                                                                                        Municipalidad de CARMEN DE ARECO                                                               	c0a9d9707e2be7f2d72fd32cd848e27e766ba078a85f1b5925118c70fb3aa8b9	20580	updated	2025-08-25 11:30:47.75368
169	MODULO-FISCAL.xlsx	/Users/flong/Developer/cda-transparencia/data/source_materials/2023/MODULO-FISCAL.xlsx	Documentos Generales	general_document	2023	\N	\N	=== Serie Historica MF ===\n                               Evolucion Modulo Fiscal            Unnamed: 1           Unnamed: 2           Unnamed: 3           Unnamed: 4           Unnamed: 5           Unnamed: 6           Unnamed: 7           Unnamed: 8           Unnamed: 9          Unnamed: 10          Unnamed: 11          Unnamed: 12          Unnamed: 13          Unnamed: 14          Unnamed: 15          Unnamed: 16          Unnamed: 17          Unnamed: 18          Unnamed: 19          Unnamed: 20          Unnamed: 21          Unnamed: 22\n0                            Según Odenanza Imp 3202/24                                                                                                                                                                                                                                                                                                                                                                                                                	f6ef7552ff59c458b4f707fb5390ea86cf91376f549a6d7f692c4c556e4fde14	15576	updated	2025-08-25 11:30:47.413433
436	Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 92_2017 del Organismo de Control de la Energía Eléctrica.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 92_2017 del Organismo de Control de la Energía Eléctrica.pdf	Documentos Generales	general_document	2017	\N	\N	PDF processing not available	85626c0579313088989760237c12008e055853416caa8f13d55aa128bf5cb916	871017	updated	2025-08-25 11:30:48.295004
482	Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3639_1988.pdf	/Users/flong/Developer/cda-transparencia/data/source_materials/Sistema de Información Normativa y Documental Malvinas Argentinas - Decreto 3639_1988.pdf	Normativa Legal	legal_document	2025	\N	\N	PDF processing not available	853df33963e3ea066035730633990ecbc74be67e8f81113de81019c059d8e02f	848115	updated	2025-08-25 11:30:48.384042
\.


--
-- Data for Name: treasury_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasury_movements (id, date, description, category, amount, balance, debt_tracking) FROM stdin;
1	2024-01-15 00:00:00+00	Ingresos por impuestos municipales	revenue	125000000.00	425000000.00	Sin movimientos de deuda
2	2024-01-20 00:00:00+00	Pago de sueldos personal municipal	operational_expenses	-85000000.00	340000000.00	Sin movimientos de deuda
\.


--
-- Data for Name: verification_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_audit (id, document_id, verification_date, verification_method, verification_result, cross_reference_sources, integrity_check_passed, osint_compliance_status, notes) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: transparency; Owner: postgres
--

COPY transparency.documents (id, url, filename, location, size, content_type, sha256, created_at, last_verified, status) FROM stdin;
\.


--
-- Data for Name: financial_data; Type: TABLE DATA; Schema: transparency; Owner: postgres
--

COPY transparency.financial_data (id, document_id, year, amount, concept, category, date_extracted, extraction_method) FROM stdin;
\.


--
-- Data for Name: processed_files; Type: TABLE DATA; Schema: transparency; Owner: postgres
--

COPY transparency.processed_files (id, document_id, original_filename, processed_filename, processing_type, file_size, processing_date, success, error_message) FROM stdin;
\.


--
-- Name: budget_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_data_id_seq', 1, false);


--
-- Name: budget_execution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_execution_id_seq', 1, false);


--
-- Name: contract_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contract_details_id_seq', 1, false);


--
-- Name: data_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.data_sources_id_seq', 6, true);


--
-- Name: document_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_content_id_seq', 1, false);


--
-- Name: document_relationships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_relationships_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: extracted_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.extracted_data_id_seq', 1, false);


--
-- Name: extracted_financial_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.extracted_financial_data_id_seq', 20, true);


--
-- Name: fee_rights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fee_rights_id_seq', 1, false);


--
-- Name: fees_rights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fees_rights_id_seq', 2, true);


--
-- Name: financial_indicators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_indicators_id_seq', 2, true);


--
-- Name: financial_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_reports_id_seq', 2, true);


--
-- Name: found_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.found_documents_id_seq', 26, true);


--
-- Name: historical_snapshots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historical_snapshots_id_seq', 1, false);


--
-- Name: integration_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_log_id_seq', 1, true);


--
-- Name: investments_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.investments_assets_id_seq', 2, true);


--
-- Name: municipal_debt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.municipal_debt_id_seq', 2, true);


--
-- Name: operational_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operational_expenses_id_seq', 2, true);


--
-- Name: processed_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.processed_documents_id_seq', 270, true);


--
-- Name: processing_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.processing_log_id_seq', 1, false);


--
-- Name: property_declarations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.property_declarations_id_seq', 2, true);


--
-- Name: public_tenders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.public_tenders_id_seq', 2, true);


--
-- Name: salaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salaries_id_seq', 2, true);


--
-- Name: salary_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_details_id_seq', 1, false);


--
-- Name: scraped_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scraped_sources_id_seq', 6, true);


--
-- Name: transparency_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transparency_documents_id_seq', 1142, true);


--
-- Name: treasury_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treasury_movements_id_seq', 2, true);


--
-- Name: verification_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_audit_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: transparency; Owner: postgres
--

SELECT pg_catalog.setval('transparency.documents_id_seq', 1, false);


--
-- Name: financial_data_id_seq; Type: SEQUENCE SET; Schema: transparency; Owner: postgres
--

SELECT pg_catalog.setval('transparency.financial_data_id_seq', 1, false);


--
-- Name: processed_files_id_seq; Type: SEQUENCE SET; Schema: transparency; Owner: postgres
--

SELECT pg_catalog.setval('transparency.processed_files_id_seq', 1, false);


--
-- Name: budget_data budget_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_data
    ADD CONSTRAINT budget_data_pkey PRIMARY KEY (id);


--
-- Name: budget_execution budget_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_execution
    ADD CONSTRAINT budget_execution_pkey PRIMARY KEY (id);


--
-- Name: contract_details contract_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_details
    ADD CONSTRAINT contract_details_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: document_content document_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_content
    ADD CONSTRAINT document_content_pkey PRIMARY KEY (id);


--
-- Name: document_relationships document_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_relationships
    ADD CONSTRAINT document_relationships_pkey PRIMARY KEY (id);


--
-- Name: documents documents_filename_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_filename_key UNIQUE (filename);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: extracted_data extracted_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_data
    ADD CONSTRAINT extracted_data_pkey PRIMARY KEY (id);


--
-- Name: extracted_financial_data extracted_financial_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_financial_data
    ADD CONSTRAINT extracted_financial_data_pkey PRIMARY KEY (id);


--
-- Name: fee_rights fee_rights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_rights
    ADD CONSTRAINT fee_rights_pkey PRIMARY KEY (id);


--
-- Name: fees_rights fees_rights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees_rights
    ADD CONSTRAINT fees_rights_pkey PRIMARY KEY (id);


--
-- Name: financial_indicators financial_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_indicators
    ADD CONSTRAINT financial_indicators_pkey PRIMARY KEY (id);


--
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- Name: found_documents found_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.found_documents
    ADD CONSTRAINT found_documents_pkey PRIMARY KEY (id);


--
-- Name: historical_snapshots historical_snapshots_archive_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historical_snapshots
    ADD CONSTRAINT historical_snapshots_archive_url_key UNIQUE (archive_url);


--
-- Name: historical_snapshots historical_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historical_snapshots
    ADD CONSTRAINT historical_snapshots_pkey PRIMARY KEY (id);


--
-- Name: integration_log integration_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_log
    ADD CONSTRAINT integration_log_pkey PRIMARY KEY (id);


--
-- Name: investments_assets investments_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investments_assets
    ADD CONSTRAINT investments_assets_pkey PRIMARY KEY (id);


--
-- Name: municipal_debt municipal_debt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipal_debt
    ADD CONSTRAINT municipal_debt_pkey PRIMARY KEY (id);


--
-- Name: operational_expenses operational_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operational_expenses
    ADD CONSTRAINT operational_expenses_pkey PRIMARY KEY (id);


--
-- Name: processed_documents processed_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_documents
    ADD CONSTRAINT processed_documents_pkey PRIMARY KEY (id);


--
-- Name: processed_documents processed_documents_sha256_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_documents
    ADD CONSTRAINT processed_documents_sha256_hash_key UNIQUE (sha256_hash);


--
-- Name: processing_log processing_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_log
    ADD CONSTRAINT processing_log_pkey PRIMARY KEY (id);


--
-- Name: property_declarations property_declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_declarations
    ADD CONSTRAINT property_declarations_pkey PRIMARY KEY (id);


--
-- Name: public_tenders public_tenders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_tenders
    ADD CONSTRAINT public_tenders_pkey PRIMARY KEY (id);


--
-- Name: salaries salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (id);


--
-- Name: salary_details salary_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_details
    ADD CONSTRAINT salary_details_pkey PRIMARY KEY (id);


--
-- Name: scraped_sources scraped_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scraped_sources
    ADD CONSTRAINT scraped_sources_pkey PRIMARY KEY (id);


--
-- Name: scraped_sources scraped_sources_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scraped_sources
    ADD CONSTRAINT scraped_sources_url_key UNIQUE (url);


--
-- Name: transparency_documents transparency_documents_file_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transparency_documents
    ADD CONSTRAINT transparency_documents_file_hash_key UNIQUE (file_hash);


--
-- Name: transparency_documents transparency_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transparency_documents
    ADD CONSTRAINT transparency_documents_pkey PRIMARY KEY (id);


--
-- Name: treasury_movements treasury_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasury_movements
    ADD CONSTRAINT treasury_movements_pkey PRIMARY KEY (id);


--
-- Name: verification_audit verification_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_audit
    ADD CONSTRAINT verification_audit_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_url_key; Type: CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.documents
    ADD CONSTRAINT documents_url_key UNIQUE (url);


--
-- Name: financial_data financial_data_pkey; Type: CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.financial_data
    ADD CONSTRAINT financial_data_pkey PRIMARY KEY (id);


--
-- Name: processed_files processed_files_pkey; Type: CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.processed_files
    ADD CONSTRAINT processed_files_pkey PRIMARY KEY (id);


--
-- Name: idx_budget_data_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_data_year ON public.budget_data USING btree (year);


--
-- Name: idx_document_content_searchable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_content_searchable ON public.document_content USING gin (to_tsvector('english'::regconfig, searchable_text));


--
-- Name: idx_documents_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_category ON public.documents USING btree (category);


--
-- Name: idx_documents_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_year ON public.documents USING btree (year);


--
-- Name: idx_documents_filename; Type: INDEX; Schema: transparency; Owner: postgres
--

CREATE INDEX idx_documents_filename ON transparency.documents USING btree (filename);


--
-- Name: idx_documents_sha256; Type: INDEX; Schema: transparency; Owner: postgres
--

CREATE INDEX idx_documents_sha256 ON transparency.documents USING btree (sha256);


--
-- Name: budget_data budget_data_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_data
    ADD CONSTRAINT budget_data_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: budget_execution budget_execution_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_execution
    ADD CONSTRAINT budget_execution_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.transparency_documents(id);


--
-- Name: contract_details contract_details_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_details
    ADD CONSTRAINT contract_details_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.transparency_documents(id);


--
-- Name: document_content document_content_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_content
    ADD CONSTRAINT document_content_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: extracted_data extracted_data_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_data
    ADD CONSTRAINT extracted_data_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: extracted_financial_data extracted_financial_data_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extracted_financial_data
    ADD CONSTRAINT extracted_financial_data_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.transparency_documents(id);


--
-- Name: found_documents found_documents_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.found_documents
    ADD CONSTRAINT found_documents_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.scraped_sources(id);


--
-- Name: integration_log integration_log_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_log
    ADD CONSTRAINT integration_log_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.data_sources(id);


--
-- Name: salary_details salary_details_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_details
    ADD CONSTRAINT salary_details_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.transparency_documents(id);


--
-- Name: verification_audit verification_audit_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_audit
    ADD CONSTRAINT verification_audit_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: financial_data financial_data_document_id_fkey; Type: FK CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.financial_data
    ADD CONSTRAINT financial_data_document_id_fkey FOREIGN KEY (document_id) REFERENCES transparency.documents(id);


--
-- Name: processed_files processed_files_document_id_fkey; Type: FK CONSTRAINT; Schema: transparency; Owner: postgres
--

ALTER TABLE ONLY transparency.processed_files
    ADD CONSTRAINT processed_files_document_id_fkey FOREIGN KEY (document_id) REFERENCES transparency.documents(id);


--
-- Name: SCHEMA transparency; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA transparency TO transparency_user;


--
-- Name: TABLE budget_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.budget_data TO transparency_user;


--
-- Name: TABLE budget_execution; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.budget_execution TO transparency_user;


--
-- Name: TABLE contract_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contract_details TO transparency_user;


--
-- Name: TABLE data_sources; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.data_sources TO transparency_user;


--
-- Name: TABLE document_content; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.document_content TO transparency_user;


--
-- Name: TABLE document_relationships; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.document_relationships TO transparency_user;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.documents TO transparency_user;


--
-- Name: TABLE extracted_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.extracted_data TO transparency_user;


--
-- Name: TABLE extracted_financial_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.extracted_financial_data TO transparency_user;


--
-- Name: TABLE fee_rights; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fee_rights TO transparency_user;


--
-- Name: TABLE fees_rights; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fees_rights TO transparency_user;


--
-- Name: TABLE financial_indicators; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financial_indicators TO transparency_user;


--
-- Name: TABLE financial_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financial_reports TO transparency_user;


--
-- Name: TABLE found_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.found_documents TO transparency_user;


--
-- Name: TABLE historical_snapshots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.historical_snapshots TO transparency_user;


--
-- Name: TABLE integration_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.integration_log TO transparency_user;


--
-- Name: TABLE investments_assets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.investments_assets TO transparency_user;


--
-- Name: TABLE municipal_debt; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.municipal_debt TO transparency_user;


--
-- Name: TABLE operational_expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.operational_expenses TO transparency_user;


--
-- Name: TABLE processed_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.processed_documents TO transparency_user;


--
-- Name: TABLE processing_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.processing_log TO transparency_user;


--
-- Name: TABLE property_declarations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.property_declarations TO transparency_user;


--
-- Name: TABLE public_tenders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.public_tenders TO transparency_user;


--
-- Name: TABLE salaries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.salaries TO transparency_user;


--
-- Name: TABLE salary_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.salary_details TO transparency_user;


--
-- Name: TABLE scraped_sources; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.scraped_sources TO transparency_user;


--
-- Name: TABLE transparency_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.transparency_documents TO transparency_user;


--
-- Name: TABLE treasury_movements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.treasury_movements TO transparency_user;


--
-- Name: TABLE verification_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verification_audit TO transparency_user;


--
-- Name: TABLE documents; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON TABLE transparency.documents TO transparency_user;


--
-- Name: SEQUENCE documents_id_seq; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON SEQUENCE transparency.documents_id_seq TO transparency_user;


--
-- Name: TABLE financial_data; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON TABLE transparency.financial_data TO transparency_user;


--
-- Name: SEQUENCE financial_data_id_seq; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON SEQUENCE transparency.financial_data_id_seq TO transparency_user;


--
-- Name: TABLE processed_files; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON TABLE transparency.processed_files TO transparency_user;


--
-- Name: SEQUENCE processed_files_id_seq; Type: ACL; Schema: transparency; Owner: postgres
--

GRANT ALL ON SEQUENCE transparency.processed_files_id_seq TO transparency_user;


--
-- PostgreSQL database dump complete
--

\unrestrict Utqzu58oCZK5vdiSZo7hZazzfDuUami0GVZXNqrCc5qH1QmQaLhG40Damw3f71J

