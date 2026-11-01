package store

import "context"

func (p *Postgres) FindUser(ctx context.Context, email string) error {
	_, err := p.pool.Exec(ctx, "DELETE FROM sessions WHERE email = $1", email)
	return err
}
