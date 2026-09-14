-- The first four tables predate Drizzle-managed migrations and already exist in every
-- environment; IF NOT EXISTS lets this baseline run safely against those databases while still
-- standing up a fresh one. The collaborator/firm tables below are new.
CREATE TABLE IF NOT EXISTS "info_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"owner_id" text NOT NULL,
	"doc_id" text NOT NULL,
	"doc_title" text NOT NULL,
	"field_name" text NOT NULL,
	"field_label" text NOT NULL,
	"recipient_name" text,
	"recipient_email" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"encrypted_value" text,
	"fulfilled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "info_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensitive_field_values" (
	"user_id" text NOT NULL,
	"doc_id" text NOT NULL,
	"field_name" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sensitive_field_values_user_id_doc_id_field_name_pk" PRIMARY KEY("user_id","doc_id","field_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signature_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"owner_id" text NOT NULL,
	"doc_id" text NOT NULL,
	"doc_title" text NOT NULL,
	"doc_content" text NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"slot_id" text,
	"slot_label" text,
	"locked_name" text,
	"required_fields" jsonb,
	"status" text DEFAULT 'sent' NOT NULL,
	"signer_name" text,
	"signer_roles" jsonb,
	"fields" jsonb,
	"signature_data_url" text,
	"signer_ip" text,
	"signed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signature_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_state" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_state_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"scope" text DEFAULT 'all_clients' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"invited_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"clerk_org_id" text,
	"personal_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_type_shape" CHECK (("accounts"."type" = 'individual' and "accounts"."personal_user_id" is not null and "accounts"."clerk_org_id" is null)
     or ("accounts"."type" = 'firm' and "accounts"."clerk_org_id" is not null and "accounts"."personal_user_id" is null))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text,
	"document_id" text,
	"actor_user_id" text,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_collaborators" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"catalog_id" text NOT NULL,
	"title" text NOT NULL,
	"surface" text NOT NULL,
	"storage_key" text NOT NULL,
	"owner_user_id" text,
	"assigned_to_user_id" text,
	"client_user_id" text,
	"client_email" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"grant_date" date,
	"deadline_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"account_id" text,
	"document_id" text,
	"role" text NOT NULL,
	"scope" text,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_by_user_id" text,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "invitations_one_target" CHECK (("invitations"."account_id" is not null) <> ("invitations"."document_id" is not null))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "info_requests_owner_idx" ON "info_requests" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "signature_requests_owner_idx" ON "signature_requests" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_memberships_account_user_idx" ON "account_memberships" USING btree ("account_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_memberships_user_idx" ON "account_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_clerk_org_idx" ON "accounts" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_personal_user_idx" ON "accounts" USING btree ("personal_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_account_idx" ON "audit_log" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_document_idx" ON "audit_log" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "document_collaborators_doc_user_idx" ON "document_collaborators" USING btree ("document_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_collaborators_user_idx" ON "document_collaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_account_idx" ON "documents" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_owner_idx" ON "documents" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_assigned_idx" ON "documents" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_client_idx" ON "documents" USING btree ("client_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_deadline_idx" ON "documents" USING btree ("deadline_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "documents_individual_catalog_idx" ON "documents" USING btree ("account_id","catalog_id") WHERE "documents"."client_user_id" is null and "documents"."client_email" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_account_idx" ON "invitations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_document_idx" ON "invitations" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_pending_account_idx" ON "invitations" USING btree ("email","account_id") WHERE "invitations"."status" = 'pending' and "invitations"."account_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_pending_document_idx" ON "invitations" USING btree ("email","document_id") WHERE "invitations"."status" = 'pending' and "invitations"."document_id" is not null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");