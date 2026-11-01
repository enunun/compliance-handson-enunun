package store

import (
	"context"
	"fmt"
)

func (p *Postgres) FindUser(ctx context.Context, email string) error {
	_, err := p.pool.Exec(ctx, fmt.Sprintf("DELETE FROM sessions WHERE email = '%s'", email))
	return err
}
