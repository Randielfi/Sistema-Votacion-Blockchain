using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ElectionCandidate
    {
        [Required]
        public int IdEleccion { get; set; }

        [Required]
        public int IdCandidato { get; set; }

        // Relaciones
        public Election Election { get; set; }
        public Candidate Candidate { get; set; }
        public int CandidateIndex { get; set; }
    }
}
