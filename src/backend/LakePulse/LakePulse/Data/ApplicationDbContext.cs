using Microsoft.EntityFrameworkCore;
using LakePulse.Models;

namespace LakePulse.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<UserLake> UserLakes { get; set; }
        public DbSet<FavouriteCharacteristic> FavouriteCharacteristics { get; set; }
        public DbSet<FieldNote> FieldNotes { get; set; }
        public DbSet<FieldNoteLike> FieldNoteLikes { get; set; }
        public DbSet<LakeAdmin> LakeAdmin { get; set; }
        public DbSet<LakeSubscription> LakeSubscriptions { get; set; }
        public DbSet<Features> features { get; set; }
        public DbSet<DataHubEditLog> DataHubEditLogs { get; set; }
        public DbSet<ToolboxPurchases> toolbox_purchases { get; set; }
        public DbSet<DataSource> DataSources { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<AlertLog> AlertLogs { get; set; }
        public DbSet<AlertLevel> AlertLevels { get; set; }
        public DbSet<AlertCategorie> AlertCategories { get; set; }
        public DbSet<AlertPreference> AlertPreferences { get; set; }
        public DbSet<AlertPreferencesCategorie> AlertPreferencesCategories { get; set; }
        public DbSet<AlertPreferencesLevel> AlertPreferencesLevels { get; set; }
        public DbSet<DataPartner> DataPartners { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<UserLake>(entity =>
            {
                entity.ToTable("UserLake");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.LakeId).IsRequired();

            });
            modelBuilder.Entity<FavouriteCharacteristic>(entity =>
            {
                entity.ToTable("FavouriteCharacteristic");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.CharacteristicId).IsRequired();
                entity.Property(e => e.UserLakeId).IsRequired();
                entity.HasOne(e => e.UserLake)
                .WithMany(e => e.FavouriteCharacteristics)
                .HasForeignKey(e => e.UserLakeId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<FieldNote>(entity =>
            {
                entity.ToTable("FieldNote");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.UserName).IsRequired();
                entity.Property(e => e.Note).IsRequired();
                entity.Property(e => e.LakeId).IsRequired();
                entity.HasOne(e => e.ParentFieldNote)
              .WithMany()
              .HasForeignKey(e => e.FieldNoteId)
              .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<FieldNoteLike>(entity =>
            {
                entity.ToTable("FieldNoteLike");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.FieldNoteId).IsRequired();
                entity.HasOne(e => e.FieldNote)
                      .WithMany(e => e.FieldNoteLike)
                      .HasForeignKey(e => e.FieldNoteId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<DataHubEditLog>(entity =>
            {
                entity.ToTable("DataHubEditLog");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });
            modelBuilder.Entity<ToolboxPurchases>(entity =>
            {
                entity.ToTable("toolbox_purchases");
                entity.HasKey(e => e.lp_trans_no);
                entity.Property(e => e.lp_trans_no).ValueGeneratedOnAdd();
            });          
            modelBuilder.Entity<AlertPreferencesCategorie>()
                .HasIndex(uc => new { uc.UserId, uc.CategoryId })
                .IsUnique();
            modelBuilder.Entity<AlertPreferencesLevel>()
                .HasIndex(uc => new { uc.UserId, uc.LevelId })
                .IsUnique();
            modelBuilder.Entity< DataPartner >()
                .HasIndex(uc => new { uc.LakePulseId, uc.Name })
                .IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}
