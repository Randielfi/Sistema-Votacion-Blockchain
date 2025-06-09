using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Candidate
    {
        [Key]
        public int IdCandidato { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombres { get; set; }

        [Required]
        [MaxLength(100)]
        public string Apellidos { get; set; }

        // Relaciones
        public ICollection<ElectionCandidate> ElectionCandidates { get; set; }
    }
}
