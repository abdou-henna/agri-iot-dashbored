import { getPool } from '../db.js';

const fallbackNames = {
  MAIN: 'Pivot 1',
  N2: 'Pivot 2',
  N3: 'Weather'
};

class NodesService {
  async getNodes() {
    const pool = getPool();
    const query = `
      SELECT
        node_id,
        node_type,
        COALESCE(name, CASE node_id
          WHEN 'MAIN' THEN $1
          WHEN 'N2' THEN $2
          WHEN 'N3' THEN $3
          ELSE node_id
        END) AS name,
        gateway_id,
        last_seen_at,
        last_seq
      FROM nodes
      WHERE node_id IN ('MAIN', 'N2', 'N3')
      ORDER BY CASE node_id
        WHEN 'MAIN' THEN 1
        WHEN 'N2' THEN 2
        WHEN 'N3' THEN 3
        ELSE 4
      END
    `;

    const result = await pool.query(query, [
      fallbackNames.MAIN,
      fallbackNames.N2,
      fallbackNames.N3
    ]);

    return result.rows;
  }
}

export const nodesService = new NodesService();
