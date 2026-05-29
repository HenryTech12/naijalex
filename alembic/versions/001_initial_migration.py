"""initial migration

Revision ID: 001
Revises: 
Create Date: 2026-05-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # This is a simplified version of the schema for the initial migration
    op.create_table('user_profiles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('business_type', sa.String(), nullable=True),
        sa.Column('industry', sa.String(), nullable=True),
        sa.Column('risk_tolerance', sa.String(), nullable=True),
        sa.Column('typical_contracts', sa.JSON(), nullable=True),
        sa.Column('session_count', sa.Integer(), nullable=True),
        sa.Column('last_seen', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone_number')
    )
    op.create_table('documents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('ocr_used', sa.Boolean(), nullable=True),
        sa.Column('document_type', sa.String(), nullable=True),
        sa.Column('jurisdiction', sa.String(), nullable=True),
        sa.Column('governing_law', sa.String(), nullable=True),
        sa.Column('estimated_value', sa.BigInteger(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('document_analyses',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('document_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('language_mode', sa.String(), nullable=True),
        sa.Column('clauses', sa.JSON(), nullable=False),
        sa.Column('overall_risk', sa.String(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('top_3_actions', sa.JSON(), nullable=False),
        sa.Column('risk_card_url', sa.String(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('session_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('document_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('channel', sa.String(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('whatsapp_message_sid', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('session_history')
    op.drop_table('document_analyses')
    op.drop_table('documents')
    op.drop_table('user_profiles')
