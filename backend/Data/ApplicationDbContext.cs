using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Voter> Voters { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<Election> Elections { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<ElectionCandidate> ElectionCandidates { get; set; }
        public DbSet<ElectionSignature> ElectionSignatures { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Voter>()
                .HasIndex(v => v.Wallet)
                .IsUnique();

            modelBuilder.Entity<Voter>()
                .HasIndex(v => v.NumeroCedula)
                .IsUnique();

            modelBuilder.Entity<Vote>()
                .HasKey(v => v.Id);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Election)
                .WithMany(e => e.Votes)
                .HasForeignKey(v => v.IdEleccion);

            // ElectionCandidate PK compuesta
            modelBuilder.Entity<ElectionCandidate>()
                .HasKey(ec => new { ec.IdEleccion, ec.IdCandidato });

            modelBuilder.Entity<ElectionCandidate>()
                .HasOne(ec => ec.Election)
                .WithMany(e => e.ElectionCandidates)
                .HasForeignKey(ec => ec.IdEleccion);

            modelBuilder.Entity<ElectionCandidate>()
                .HasOne(ec => ec.Candidate)
                .WithMany(c => c.ElectionCandidates)
                .HasForeignKey(ec => ec.IdCandidato);

            base.OnModelCreating(modelBuilder);
        }
    }
}
