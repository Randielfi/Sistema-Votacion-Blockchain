using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static backend.Services.BlockchainService;

namespace backend.Models
{
    public class Vote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int IdEleccion { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        // Relaciones
        public Election Election { get; set; }
    }
}
