using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FullDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    IdCandidato = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombres = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.IdCandidato);
                });

            migrationBuilder.CreateTable(
                name: "Elections",
                columns: table => new
                {
                    IdEleccion = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TituloEleccion = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ElectionIdOnChain = table.Column<uint>(type: "INTEGER", nullable: false),
                    Iniciada = table.Column<bool>(type: "INTEGER", nullable: false),
                    Terminada = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Elections", x => x.IdEleccion);
                });

            migrationBuilder.CreateTable(
                name: "ElectionSignatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ElectionIdOnChain = table.Column<uint>(type: "INTEGER", nullable: false),
                    IntegrityHash = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    ObserverName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ObserverPublicKey = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ObserverSignature = table.Column<string>(type: "TEXT", nullable: false),
                    FechaFirma = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectionSignatures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Voters",
                columns: table => new
                {
                    IdVotante = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NumeroCedula = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Nombres = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Wallet = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Contraseña = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Nonce = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Voters", x => x.IdVotante);
                });

            migrationBuilder.CreateTable(
                name: "ElectionCandidates",
                columns: table => new
                {
                    IdEleccion = table.Column<int>(type: "INTEGER", nullable: false),
                    IdCandidato = table.Column<int>(type: "INTEGER", nullable: false),
                    CandidateIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectionCandidates", x => new { x.IdEleccion, x.IdCandidato });
                    table.ForeignKey(
                        name: "FK_ElectionCandidates_Candidates_IdCandidato",
                        column: x => x.IdCandidato,
                        principalTable: "Candidates",
                        principalColumn: "IdCandidato",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ElectionCandidates_Elections_IdEleccion",
                        column: x => x.IdEleccion,
                        principalTable: "Elections",
                        principalColumn: "IdEleccion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Votes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdEleccion = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Votes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Votes_Elections_IdEleccion",
                        column: x => x.IdEleccion,
                        principalTable: "Elections",
                        principalColumn: "IdEleccion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElectionCandidates_IdCandidato",
                table: "ElectionCandidates",
                column: "IdCandidato");

            migrationBuilder.CreateIndex(
                name: "IX_Voters_NumeroCedula",
                table: "Voters",
                column: "NumeroCedula",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Voters_Wallet",
                table: "Voters",
                column: "Wallet",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Votes_IdEleccion",
                table: "Votes",
                column: "IdEleccion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ElectionCandidates");

            migrationBuilder.DropTable(
                name: "ElectionSignatures");

            migrationBuilder.DropTable(
                name: "Voters");

            migrationBuilder.DropTable(
                name: "Votes");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "Elections");
        }
    }
}
