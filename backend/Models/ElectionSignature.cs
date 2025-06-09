using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ElectionSignature
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public uint ElectionIdOnChain { get; set; }

        [Required]
        [MaxLength(128)]
        public string IntegrityHash { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string ObserverName { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string ObserverPublicKey { get; set; } = null!;

        [Required]
        public string ObserverSignature { get; set; } = null!;

        [Required]
        public DateTime FechaFirma { get; set; } = DateTime.UtcNow;
    }
}
