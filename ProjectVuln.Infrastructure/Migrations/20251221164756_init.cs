using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectVuln.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodeScans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: true),
                    RepoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    HasVulnerabilities = table.Column<bool>(type: "INTEGER", nullable: true),
                    Branch = table.Column<string>(type: "TEXT", nullable: true),
                    ConfidenceScore = table.Column<double>(type: "REAL", nullable: true),
                    AiRawResponse = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodeScans", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodeScans");
        }
    }
}
