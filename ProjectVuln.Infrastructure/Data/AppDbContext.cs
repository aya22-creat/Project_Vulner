using Microsoft.EntityFrameworkCore;
using ProjectVuln.Domain.entity;

namespace ProjectVuln.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<CodeScan> CodeScans { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        // Suppress the pending changes warning for SQLite
        optionsBuilder.ConfigureWarnings(w => 
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CodeScan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.Status).IsRequired();
        });
    }
}



