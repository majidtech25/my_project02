"""add sale payment tracking fields

Revision ID: 202501201045
Revises: 202501141230
Create Date: 2025-01-20 10:45:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202501201045"
down_revision = "202501141230"
branch_labels = None
depends_on = None


payment_method_enum = sa.Enum("cash", "mpesa", "card", name="paymentmethod")


def upgrade() -> None:
    bind = op.get_bind()
    payment_method_enum.create(bind, checkfirst=True)

    with op.batch_alter_table("sales", schema=None) as batch_op:
        batch_op.add_column(sa.Column("payment_method", payment_method_enum, nullable=True))
        batch_op.add_column(sa.Column("is_paid", sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column("is_credit", sa.Boolean(), nullable=False, server_default=sa.false()))

    # assume historical sales are paid unless referenced by an open credit
    op.execute("UPDATE sales SET is_paid = 1")
    op.execute(
        """
        UPDATE sales
        SET is_credit = 1,
            is_paid = 0,
            payment_method = NULL
        WHERE id IN (SELECT sale_id FROM credits)
        """
    )

    with op.batch_alter_table("sales", schema=None) as batch_op:
        batch_op.alter_column("is_paid", server_default=None)
        batch_op.alter_column("is_credit", server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("sales", schema=None) as batch_op:
        batch_op.drop_column("is_credit")
        batch_op.drop_column("is_paid")
        batch_op.drop_column("payment_method")

    bind = op.get_bind()
    payment_method_enum.drop(bind, checkfirst=True)
