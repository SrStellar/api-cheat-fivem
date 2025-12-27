/**
 * Configuração de Banco de Dados
 * Define parâmetros de conexão e comportamento do SQLite
 */

module.exports = {
  path: process.env.DB_PATH || './data/auth.db',
  verbose: process.env.NODE_ENV !== 'production',
  
  // Modo de abertura (rw = read+write)
  mode: 'sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE',
  
  // Configurações de performance
  journal_mode: 'WAL',
  synchronous: 'NORMAL',
  
  // Timeout
  timeout: 5000,
  
  // Backup
  backupEnabled: process.env.BACKUP_ENABLED !== 'false',
  backupInterval: (parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24) * 60 * 60 * 1000,
  backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  backupPath: './backups'
};
