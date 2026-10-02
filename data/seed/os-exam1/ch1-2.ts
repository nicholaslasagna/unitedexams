import type { Question } from "@/lib/types";

export const introductionQuestions: Question[] = [
  {
    id: "os-e1-c1-01", type: "single", difficulty: "easy",
    prompt: "OS is software or hardware?",
    options: ["Software", "Hardware"], correct: [0],
    explanation: "An operating system is a program that acts as an intermediary between the user and computer hardware.",
    references: ["Ch1 Introduction.pdf, PDF page 21"],
    tags: ["chapter-1", "os-role", "slide-exercise"]
  },
  {
    id: "os-e1-c1-02", type: "single", difficulty: "easy",
    prompt: "Interrupts may be triggered by either hardware or software.",
    options: ["True", "False"], correct: [0],
    explanation: "True in the slide's broad use of interrupt. Devices generate hardware interrupts; software-generated events include traps for system calls and exceptions such as calculation errors.",
    references: ["Ch1 Introduction.pdf, PDF pages 31-35"],
    tags: ["chapter-1", "interrupts", "slide-exercise"]
  },
  {
    id: "os-e1-c1-03", type: "single", difficulty: "easy",
    prompt: "A ____ can be used to prevent a user program from never returning control to the operating system.",
    options: ["portal", "program counter", "firewall", "timer"], correct: [3],
    explanation: "The OS sets a timer before giving a user program the CPU. Expiration generates an interrupt that returns control to the OS, even if the program loops indefinitely.",
    references: ["Ch1 Introduction.pdf, PDF pages 44-45"],
    tags: ["chapter-1", "timer", "slide-exercise"]
  },
  {
    id: "os-e1-c1-04", type: "multi", difficulty: "med",
    prompt: "Which operations should be restricted to kernel mode? Select all that apply. For this adaptation of the slide exercise, 'clear memory' means clear another process's protected memory, and 'issue an instruction' means issue a device I/O instruction.",
    options: ["Read the clock through a permitted read-only interface", "Clear another process's protected memory", "Issue a device I/O instruction directly", "Turn off interrupts", "Modify entries in the OS device-status table"],
    correct: [1, 2, 3, 4],
    explanation: "The privileged operations can disrupt devices, defeat OS control, or damage another process. Reading the clock through an allowed interface is safe. The original slide leaves 'clear memory' and 'issue an instruction' unspecified; ordinary writes to one's own memory and ordinary computation do not require kernel mode, so their meanings are explicitly narrowed here.",
    hintSteps: ["Ask whether unrestricted execution could bypass protection or prevent the OS from regaining control.", "Distinguish clearing your own permitted memory from clearing someone else's protected memory."],
    walkthroughSteps: ["A read-only clock interface does not alter protected resources.", "Cross-process memory access violates isolation; direct device I/O and device-status edits affect shared hardware.", "Disabling interrupts could stop the timer from returning control to the OS.", "Select the four operations that change protected state or bypass OS control."],
    references: ["Ch1 Introduction.pdf, PDF pages 41, 44, 46"],
    tags: ["chapter-1", "privileged-instructions", "slide-exercise"]
  },
  {
    id: "os-e1-c1-05", type: "fill", difficulty: "med",
    prompt: "Using the slide's binary convention, 1 KB = 1,024 bytes and 1 MB = 1,024 KB. How many bytes are in 2 MB? Enter an integer; the unit is bytes.",
    correct: ["2097152", "2,097,152"],
    explanation: "2 × 1,024 × 1,024 = 2,097,152 bytes. The slide uses KB/MB labels for binary powers; the convention is stated so decimal megabytes are not a competing answer.",
    hintSteps: ["Convert MB to KB, then KB to bytes.", "Multiply 2 by 1,024 twice."],
    walkthroughSteps: ["1 MB = 1,024 × 1,024 = 1,048,576 bytes.", "2 MB = 2 × 1,048,576 = 2,097,152 bytes."],
    references: ["Ch1 Introduction.pdf, PDF pages 38-39"],
    tags: ["chapter-1", "storage-units", "exam-style"]
  },
  {
    id: "os-e1-c1-06", type: "single", difficulty: "med",
    prompt: "Process A is waiting for disk I/O while process B is ready to compute. Which action best illustrates multiprogramming?",
    options: ["Keep A executing its blocked I/O instruction indefinitely","Run B on the CPU while A waits","Leave the CPU idle until A's disk operation finishes","Require A and B to execute on separate physical processors"],
    correct: [1],
    explanation: "Multiprogramming keeps another job available so the CPU can do useful computation when the current job waits for I/O. It does not require multiple processors.",
    references: ["Ch1 Introduction.pdf, PDF page 47"],
    tags: ["chapter-1", "multiprogramming", "exam-style"]
  },
  {
    id: "os-e1-c1-07", type: "single", difficulty: "easy",
    prompt: "Which of the following is a property of peer-to-peer systems?",
    options: ["Clients and servers are not distinguished from one another.", "Separate machines act as either the client or the server but not both.", "They do not offer any advantages over traditional client-server systems.", "They suffer from the server acting as the bottleneck in performance."],
    correct: [0],
    explanation: "Each peer may act as a client, a server, or both. There is no required permanent division into client and server roles.",
    references: ["Ch1 Introduction.pdf, PDF pages 67-68"],
    tags: ["chapter-1", "computing-environments", "peer-to-peer", "slide-exercise"]
  },
  {
    id: "os-e1-c1-08", type: "single", difficulty: "easy",
    prompt: "Security is equivalent to protection with no difference.",
    options: ["True", "False"], correct: [1],
    explanation: "Protection controls which users or processes can access resources. Security defends the system against internal and external attacks. They are related but have different scopes.",
    references: ["Ch1 Introduction.pdf, PDF pages 70, 77"],
    tags: ["chapter-1", "protection-security", "slide-exercise"]
  },
  {
    id: "os-e1-c1-09", type: "free", difficulty: "med", homeworkFormat: "multi-step",
    prompt: "A user program requests a disk read through a system call, waits while the device operates, and later receives its data. Explain the user-to-kernel transition, the device controller's role, the completion interrupt, and how a timer lets the OS regain control if the program later enters an infinite loop.",
    explanation: "A system call enters the kernel through a controlled trap; the controller manages the device and reports completion with a hardware interrupt. A timer independently prevents a user program from retaining the CPU indefinitely.",
    sampleAnswer: "The application normally runs in user mode. Its system-call request causes a controlled trap into kernel mode, where the OS validates the request and starts the read through the device controller. The controller manages the disk operation and its local buffer. While the requesting process waits, the OS may run another ready process. When the operation completes, the controller generates a hardware interrupt; the CPU enters the OS interrupt handler, which records completion and makes the waiting process eligible to resume. The kernel eventually returns to user mode. Before letting user code run, the OS sets a timer; its interrupt returns control to the OS even if the application loops forever.",
    solutionMd: "1. **Request:** the application runs in user mode and uses a system call; a trap transfers control to the kernel.\n2. **I/O:** the OS coordinates the controller, which manages its device and local buffer. Waiting for the device need not keep the CPU idle.\n3. **Completion:** a hardware interrupt transfers control to the appropriate interrupt service routine. The OS handles completion and allows the waiting process to resume when scheduled.\n4. **Protection:** the kernel controls privileged operations and returns to user mode after servicing the request.\n5. **Timer:** the OS configures a timer before running user code; expiration interrupts even an infinite loop.\n\nA complete answer distinguishes the software-generated request from the hardware-generated completion and explains why the timer does not depend on voluntary cooperation.",
    hintSteps: ["Which event is software generated, and which comes from the disk controller?", "Track the execution mode when the application requests service and when the OS handles an interrupt.", "An infinite loop cannot voluntarily call the OS. What independently interrupts it?"],
    walkthroughSteps: ["Begin with the user-mode application; its system call causes a trap and a controlled kernel-mode entry.", "The kernel coordinates I/O through the device controller and can schedule other work while the requester waits.", "Device completion generates a hardware interrupt, transferring control to the OS handler.", "The OS handles completion and later returns execution to user mode.", "A previously configured timer expires independently of the user loop, forcing control back to the OS."],
    references: ["Ch1 Introduction.pdf, PDF pages 25, 29-34, 41-44, 47"],
    tags: ["chapter-1", "interrupts", "system-calls", "dual-mode", "timer", "exam-style"]
  },
  {
    id: "os-e1-c1-10", type: "single", difficulty: "easy",
    prompt: "What is another term for kernel mode?",
    options: ["supervisor mode", "system mode", "privileged mode", "All of the above"],
    correct: [3],
    explanation: "Supervisor mode, system mode, and privileged mode all refer to kernel mode in this exercise.",
    references: ["Ch1 Introduction.pdf, PDF pages 41, 43"],
    tags: ["chapter-1", "dual-mode", "slide-exercise"]
  },
  {
    id: "os-e1-c1-11", type: "single", difficulty: "easy",
    prompt: "A(n) ________ is the unit of work in a system.",
    options: ["process", "operating system", "timer", "mode bit"], correct: [0],
    explanation: "A process is a program in execution, an active unit of work. A program stored as instructions is a passive entity.",
    references: ["Ch1 Introduction.pdf, PDF pages 49, 54"],
    tags: ["chapter-1", "process-basics", "slide-exercise"]
  },
  {
    id: "os-e1-c1-12", type: "single", difficulty: "easy",
    prompt: "A _____ provides a file-system interface which allows clients to create and modify files.",
    options: ["compute-server system", "file-server system", "wireless network", "network computer"], correct: [1],
    explanation: "A file server provides a client interface for storing, retrieving, creating, and modifying files.",
    references: ["Ch1 Introduction.pdf, PDF pages 66, 69"],
    tags: ["chapter-1", "computing-environments", "client-server", "slide-exercise"]
  },
  {
    id: "os-e1-c1-13", type: "single", difficulty: "med",
    prompt: "Compare one chip with two CPU cores to two chips with one core each. According to the slide, which has the faster communication path between its cores, assuming otherwise comparable hardware?",
    options: ["The two cores on one chip, because on-chip communication is faster", "The two cores on separate chips, because their communication avoids all interconnect overhead", "Both must have identical communication latency because their core counts match", "Neither arrangement allows one core to communicate with another"], correct: [0],
    explanation: "The slide answers its 'Which one is more efficient?' prompt by noting that on-chip communication is faster than communication between chips. This adaptation asks specifically about communication; it does not claim that every multicore workload is universally faster.",
    references: ["Ch1 Introduction.pdf, PDF pages 60-61"],
    tags: ["chapter-1", "multiprocessing", "slide-exercise"]
  },
  {
    id: "os-e1-c1-14", type: "single", difficulty: "easy",
    prompt: "Which component controls and coordinates the use of CPU, memory, and I/O hardware among applications and users?",
    options: ["The physical bus alone","Operating system","The application currently in the foreground","The compiler that built the applications"], correct: [1],
    explanation: "Hardware supplies computing resources; applications solve user problems; the operating system controls and coordinates resource use.",
    references: ["Ch1 Introduction.pdf, PDF pages 21-22"],
    tags: ["chapter-1", "os-role", "exam-style"]
  },
  {
    id: "os-e1-c1-15", type: "multi", difficulty: "easy",
    prompt: "Which are operating-system goals stated in the introduction? Select all that apply.",
    options: ["Allocate resources fairly and efficiently","Supervise programs to prevent improper use","Manage and control I/O devices","Guarantee every program runs without any hardware failure","Provide a convenient environment for executing programs"], correct: [0,1,2,4],
    explanation: "Convenience, efficient and fair allocation, supervision, and I/O control are listed goals. An OS cannot guarantee that hardware will never fail.",
    references: ["Ch1 Introduction.pdf, PDF page 24"],
    tags: ["chapter-1", "os-role", "exam-style"]
  },
  {
    id: "os-e1-c1-16", type: "single", difficulty: "med",
    prompt: "Which description correctly relates a device controller, its buffer, shared memory, and the CPU?",
    options: ["A controller determines every process's CPU scheduling priority but never manages a device","A controller has no local buffer and can signal completion only through a user-typed command","A controller must be the same hardware component as the system's general-purpose CPU","A controller manages a device type, has a local buffer, and can notify the CPU of completion by interrupt"], correct: [3],
    explanation: "Controllers connect through a bus providing access to shared memory. Each manages a device type and a local buffer. In the slide's I/O model the CPU moves data between memory and buffers, and the controller signals completion with an interrupt.",
    references: ["Ch1 Introduction.pdf, PDF pages 25, 29"],
    tags: ["chapter-1", "device-controllers", "exam-style"]
  },
  {
    id: "os-e1-c1-17", type: "single", difficulty: "easy",
    prompt: "How is a magnetic disk surface logically divided in the slides?",
    options: ["Tracks, which are subdivided into sectors", "Sectors, which are subdivided into tracks", "Pages, which are subdivided into memory frames", "Tracks, which are subdivided into user directories"], correct: [0],
    explanation: "The logical disk organization shown uses tracks and sectors; the disk controller manages interaction between the disk and computer.",
    references: ["Ch1 Introduction.pdf, PDF page 26"],
    tags: ["chapter-1", "storage-organization", "exam-style"]
  },
  {
    id: "os-e1-c1-18", type: "multi", difficulty: "med",
    prompt: "Using the slides' distinction between a hardware interrupt and a software-generated trap, which are examples of traps? Select all that apply.",
    options: ["A network device signals that a packet arrived","A user program requests an OS system routine","A calculation error raises an exception","A disk controller reports that a read has completed"], correct: [1,2],
    explanation: "System-service requests and calculation exceptions originate from executing software. Device-completion and packet-arrival signals are hardware interrupts.",
    references: ["Ch1 Introduction.pdf, PDF pages 31-33"],
    tags: ["chapter-1", "interrupts", "traps", "exam-style"]
  },
  {
    id: "os-e1-c1-19", type: "single", difficulty: "easy",
    prompt: "A computer loses electrical power. Which statement best matches the slides' volatile/nonvolatile distinction?",
    options: ["Main memory is nonvolatile, while disks are volatile","The CPU can execute a program directly from any secondary-storage device without loading it","Ordinary main-memory contents are lost; secondary storage retains its stored contents","Both main memory and secondary storage must lose all contents"], correct: [2],
    explanation: "Main memory is volatile, while secondary storage provides large nonvolatile capacity. ROM is also nonvolatile and can retain bootstrap instructions.",
    references: ["Ch1 Introduction.pdf, PDF pages 36, 40"],
    tags: ["chapter-1", "storage-hierarchy", "booting", "exam-style"]
  },
  {
    id: "os-e1-c1-20", type: "single", difficulty: "med",
    prompt: "Which order runs from shortest to longest typical access time in the slide's storage table?",
    options: ["Magnetic disk → solid-state disk → main memory → cache → registers","Cache → magnetic disk → registers → solid-state disk → main memory","Main memory → registers → magnetic disk → cache → solid-state disk","Registers → cache → main memory → solid-state disk → magnetic disk"], correct: [3],
    explanation: "The table gives registers 0.25-0.5 ns, cache 0.5-25 ns, main memory 80-250 ns, SSD 25,000-50,000 ns, and magnetic disk 5,000,000 ns. Slower levels generally provide more capacity. The table also shows cache managed by hardware and backed by main memory; main memory and disks are managed by the OS.",
    references: ["Ch1 Introduction.pdf, PDF pages 36, 58"],
    tags: ["chapter-1", "storage-hierarchy", "exam-style"]
  },
  {
    id: "os-e1-c1-21", type: "fill", difficulty: "med",
    prompt: "A byte contains 8 bits. A buffer stores 128 bytes. How many bits does it hold? Enter an integer; the unit is bits.",
    correct: ["1024", "1,024"],
    explanation: "128 bytes × 8 bits/byte = 1,024 bits.",
    hintSteps: ["Multiply the number of bytes by the number of bits per byte."],
    walkthroughSteps: ["Each of 128 bytes contributes 8 bits.", "128 × 8 = 1,024 bits."],
    references: ["Ch1 Introduction.pdf, PDF pages 38-39"],
    tags: ["chapter-1", "storage-units", "exam-style"]
  },
  {
    id: "os-e1-c1-22", type: "fill", difficulty: "med",
    prompt: "The storage table lists magnetic-disk access time as 5,000,000 ns and main-memory access time as 80-250 ns. Using 250 ns for memory, how many times as long is one disk access? Enter an integer ratio; the unit is times.",
    correct: ["20000", "20,000"],
    explanation: "5,000,000 / 250 = 20,000. Both values use nanoseconds, so no unit conversion is needed. This comparison concerns one access's latency, not transfer bandwidth.",
    hintSteps: ["A 'times as long' comparison divides the longer time by the shorter time.", "Both values are already in ns."],
    walkthroughSteps: ["Use the specified main-memory endpoint: 250 ns.", "Divide disk latency by memory latency: 5,000,000 ÷ 250 = 20,000.", "Interpret the dimensionless ratio: one disk access takes 20,000 times as long in this comparison."],
    references: ["Ch1 Introduction.pdf, PDF page 58"],
    tags: ["chapter-1", "storage-hierarchy", "latency", "exam-style"]
  },
  {
    id: "os-e1-c1-23", type: "multi", difficulty: "med",
    prompt: "Which are memory-management responsibilities of the OS? Select all that apply.",
    options: ["Allocate and deallocate memory as needed","Require every application to use exactly the same physical memory addresses","Track which memory regions are used and by whom","Decide which processes and data to move into or out of memory"], correct: [0,2,3],
    explanation: "Memory management tracks ownership, controls placement and movement, and allocates/deallocates space. Moving a process between main memory and secondary storage is illustrated as swapping out/in on the next slide. It does not require all applications to overwrite the same physical addresses.",
    references: ["Ch1 Introduction.pdf, PDF pages 55-56"],
    tags: ["chapter-1", "memory-management", "exam-style"]
  },
  {
    id: "os-e1-c1-24", type: "single", difficulty: "med",
    prompt: "A process contains three threads. Which description matches the introduction's thread model?",
    options: ["Each thread has a private copy of the entire process code and data","All three threads share one program counter","Threads share code and data only if each runs in a separate process","The threads share the process's code and data, and each thread has its own program counter"], correct: [3],
    explanation: "A thread is a dispatchable unit of work within a process. Threads share code and data, but a multithreaded process has one program counter per thread.",
    references: ["Ch1 Introduction.pdf, PDF pages 52-53"],
    tags: ["chapter-1", "thread-basics", "exam-style"]
  },
  {
    id: "os-e1-c1-25", type: "multi", difficulty: "easy",
    prompt: "Which process-management activities are assigned to the operating system? Select all that apply.",
    options: ["Suspend and resume processes","Provide mechanisms for process synchronization","Provide mechanisms for process communication","Write every application's business logic","Create and delete user and system processes"], correct: [0,1,2,4],
    explanation: "The OS manages process lifecycles and supplies synchronization and communication mechanisms. Application-specific behavior is the application's job.",
    references: ["Ch1 Introduction.pdf, PDF page 51"],
    tags: ["chapter-1", "process-management", "exam-style"]
  },
  {
    id: "os-e1-c1-26", type: "single", difficulty: "easy",
    prompt: "Which statement best describes files and directories in the introduction?",
    options: ["Every file must represent a currently executing process","A file is a collection of related information; files are usually organized into directories","A file can contain code but cannot contain data or multimedia","A directory represents the next instruction to execute in a file"], correct: [1],
    explanation: "Files may store code, data, text, music, or video. Directories organize files; a stored file need not be executing.",
    references: ["Ch1 Introduction.pdf, PDF page 57"],
    tags: ["chapter-1", "file-systems", "exam-style"]
  },
  {
    id: "os-e1-c1-27", type: "single", difficulty: "med",
    prompt: "A service uses multiple independent computers working together with shared SAN storage and aims to survive a computer's failure. Which organization is this?",
    options: ["A time-sharing system on one core","A single computer with several processes","Clustered system","A single multicore processor"], correct: [2],
    explanation: "Clustered systems combine multiple systems, commonly sharing storage through a storage-area network, to provide service despite failures.",
    references: ["Ch1 Introduction.pdf, PDF page 62"],
    tags: ["chapter-1", "clustered-systems", "exam-style"]
  },
  {
    id: "os-e1-c1-28", type: "multi", difficulty: "easy",
    prompt: "Which statements match the slides' computing environments? Select all that apply.",
    options: ["Traditional general-purpose computers may connect to networks and use firewalls","Client-server systems have servers responding to client requests","Mobile devices require wired LAN connectivity instead of Wi-Fi or cellular networks","Mobile devices can use GPS/gyroscope sensors and Wi-Fi or cellular connectivity"], correct: [0,1,3],
    explanation: "Mobile environments add sensor and connectivity features; traditional computers commonly network; servers answer client requests. Mobile devices support interactive applications, including augmented-reality uses.",
    references: ["Ch1 Introduction.pdf, PDF pages 63-66"],
    tags: ["chapter-1", "computing-environments", "exam-style"]
  },
  {
    id: "os-e1-c1-29", type: "multi", difficulty: "med",
    prompt: "Which statements about identity and access control match the slides? Select all that apply.",
    options: ["User IDs help determine access to a user's files and processes", "Group IDs can grant a set of users access to a file or process", "Privilege escalation can change an effective identity to one with more rights", "A group ID guarantees that every group member has unrestricted kernel access"], correct: [0, 1, 2],
    explanation: "User and group identities support permission decisions. Changing to a more privileged effective identity can increase rights; ordinary group membership does not imply unrestricted kernel privileges.",
    references: ["Ch1 Introduction.pdf, PDF page 71"],
    tags: ["chapter-1", "access-control", "exam-style"]
  },
  {
    id: "os-e1-c1-30", type: "multi", difficulty: "med",
    prompt: "Which threat descriptions match the slides? Select all that apply.",
    options: ["A worm can replicate and spread without a person manually forwarding each copy","A Trojan horse appears to be a legitimate application but performs malicious actions","A man-in-the-middle attacker secretly relays and may alter communication","A Trojan horse is defined by automatic self-replication, rather than deceptive appearance","A virus attaches itself to a program or file"], correct: [0,1,2,4],
    explanation: "The first four descriptions match the listed attacks. Denial of service harms availability, for example by overwhelming a resource; it does not improve it.",
    references: ["Ch1 Introduction.pdf, PDF pages 70, 72-76"],
    tags: ["chapter-1", "security-threats", "exam-style"]
  },
  {
    id: "os-e1-c1-31", type: "free", difficulty: "med", homeworkFormat: "short",
    prompt: "Distinguish multiprogramming, time sharing, multiprocessing, and clustered systems. For each, state the central purpose or hardware arrangement and give one example. Can multiprogramming and time sharing operate on a single CPU core? Explain.",
    explanation: "Multiprogramming and time sharing schedule different jobs over time; multiprocessing supplies multiple processing units; clustering coordinates multiple independent systems. The first two can work on one core through switching.",
    sampleAnswer: "Multiprogramming keeps the CPU busy by switching to another ready job when a job waits, such as computing B while A waits for disk I/O. Time sharing switches frequently enough to provide interactive response, such as alternating a terminal and an editor. Both can operate on a single core: only one job executes there at a moment, but different jobs run over time. Multiprocessing uses multiple processing units or cores, allowing simultaneous execution and potentially improving throughput and reliability; a dual-core machine is an example. A clustered system combines independent computers, commonly using shared SAN storage, to maintain a reliable service if a member fails.",
    solutionMd: "| Concept | Central idea | Example |\n|---|---|---|\n| Multiprogramming | Run another ready job during a job's wait to improve CPU use | B computes while A waits for disk |\n| Time sharing | Switch jobs frequently for interactive computing | Several terminals or applications get responsive turns |\n| Multiprocessing | Multiple processing units can execute work simultaneously | Two cores on one chip |\n| Clustering | Multiple independent systems cooperate, often for availability | SAN-backed service survives a member failure |\n\n**Single-core answer:** yes for multiprogramming and time sharing. Switching over time does not require simultaneous execution. Multiple physical processing units are what distinguish multiprocessing.",
    hintSteps: ["Separate switching over time from physically executing on multiple processing units.", "Which concept specifically targets interactive response?", "Which uses multiple independent computers rather than just multiple cores?"],
    walkthroughSteps: ["Define multiprogramming by its response to I/O waits and utilization goal.", "Define time sharing by frequent switching and interactive response.", "Identify multiprocessing as the multiple-processing-unit arrangement, including multicore hardware.", "Identify clustering as coordination of independent systems with an availability goal.", "Explain that one core can switch between jobs but cannot execute two instruction streams at the same instant."],
    references: ["Ch1 Introduction.pdf, PDF pages 47-48, 59-62"],
    tags: ["chapter-1", "multiprogramming", "time-sharing", "multiprocessing", "clustered-systems", "exam-style"]
  },
  {
    id: "os-e1-c1-32", type: "free", difficulty: "med", homeworkFormat: "multi-step",
    prompt: "A university server (1) denies a student permission to open another student's private file, (2) is flooded with requests until legitimate users cannot connect, and (3) receives an application that looks useful but secretly installs a backdoor. Identify the protection or security issue in each case. Explain how user/group IDs relate to case 1 and why protection and security are not interchangeable terms.",
    explanation: "File permission enforcement is protection. The flood is denial of service and the deceptive application is a Trojan horse; both are security threats. Identity-based access control supports protection but does not cover every attack.",
    sampleAnswer: "Case 1 is protection: access to a file is controlled using permissions associated with users and groups. User IDs associate identities with files and processes, and group IDs can grant a set of users shared access without opening the file to everyone. Case 2 is a denial-of-service security attack against availability. Case 3 is a Trojan horse because a seemingly legitimate application hides malicious behavior, here a backdoor. Protection governs authorized access to resources; security defends against attacks from inside or outside the system. Good permissions help security, but alone do not eliminate floods or malicious software.",
    solutionMd: "1. **Private file:** protection controls resource access. Compare the requesting user's identity and applicable group memberships to the file's permissions.\n2. **Flood:** denial of service attacks availability by consuming resources or overwhelming service.\n3. **Deceptive app:** a Trojan horse disguises malicious behavior as a legitimate application; a backdoor is one possible consequence.\n4. **Relationship:** protection supplies access rules; security includes defending against attacks that may go beyond permission checks.\n\nA complete answer names both attacks and explains the purpose of user/group identity rather than merely listing the terms.",
    hintSteps: ["Ask whether the case is about an authorized-access rule or an adversarial attack.", "Which listed attack makes legitimate service unavailable?", "Which attack is disguised as a useful application?"],
    walkthroughSteps: ["Classify private-file denial as enforcement of a protection rule.", "Connect identities and group membership to deciding which access rules apply.", "Classify request flooding as denial of service against availability.", "Classify the deceptive backdoor application as a Trojan horse.", "Explain that access control is one part of defending a system, while security also addresses other attack mechanisms."],
    references: ["Ch1 Introduction.pdf, PDF pages 70-72, 75, 77"],
    tags: ["chapter-1", "protection-security", "access-control", "security-threats", "exam-style"]
  }
];

export const structureQuestions: Question[] = [
  {
    id: "os-e1-c2-01", type: "single", difficulty: "easy",
    prompt: "System call interface is the boundary between user programs and operating system services.",
    options: ["Yes", "No"], correct: [0],
    explanation: "The system-call interface provides the controlled boundary through which applications request kernel services.",
    references: ["Ch2 OS Structure.pdf, PDF pages 21-22, 28"],
    tags: ["chapter-2", "system-calls", "slide-exercise"]
  },
  {
    id: "os-e1-c2-02", type: "single", difficulty: "easy",
    prompt: "_____ is/are not a technique for passing parameters from an application to a system call.",
    options: ["Cache memory", "Registers", "Stack", "Special block in memory"], correct: [0],
    explanation: "The slide lists registers, a memory block whose address is passed in a register, and the stack. Cache memory may hold copies of memory data, but it is not a separate calling-convention mechanism on this list.",
    references: ["Ch2 OS Structure.pdf, PDF pages 30-31"],
    tags: ["chapter-2", "parameter-passing", "slide-exercise"]
  },
  {
    id: "os-e1-c2-03", type: "single", difficulty: "med",
    prompt: "The OS service body of a system call can execute in either user mode or kernel mode.",
    options: ["True", "False"], correct: [1],
    explanation: "False: the requested system-call service executes in the OS kernel in kernel mode. The user program invokes it, often through a user-mode API/library wrapper. This adaptation clarifies the slide's 'System calls can be run in either user mode or kernel mode' by distinguishing invocation from execution of the kernel service.",
    references: ["Ch2 OS Structure.pdf, PDF pages 28-29, 32"],
    tags: ["chapter-2", "system-calls", "dual-mode", "slide-exercise"]
  },
  {
    id: "os-e1-c2-04", type: "single", difficulty: "easy",
    prompt: "A statically-linked library is only linked and loaded if it is conditionally required during program runtime.",
    options: ["True", "False"], correct: [1],
    explanation: "Static linking incorporates required library code into the executable when it is linked. Loading a shared library as needed at runtime is dynamic linking/loading behavior, not static linking.",
    references: ["Ch2 OS Structure.pdf, PDF pages 33-35"],
    tags: ["chapter-2", "linking-loading", "slide-exercise"]
  },
  {
    id: "os-e1-c2-05", type: "single", difficulty: "easy",
    prompt: "A microkernel is a kernel ____.",
    options: ["containing many components that are optimized to reduce resident memory size", "that is compressed before loading in order to reduce its resident memory size", "that is compiled to produce the smallest size possible when stored to disk", "that is stripped of all nonessential components"], correct: [3],
    explanation: "A microkernel keeps only essential services in the kernel and moves other OS services to user-level programs. Its defining property is service placement, not executable compression.",
    references: ["Ch2 OS Structure.pdf, PDF pages 42-43, 48"],
    tags: ["chapter-2", "os-architecture", "microkernel", "slide-exercise"]
  },
  {
    id: "os-e1-c2-06", type: "single", difficulty: "easy",
    prompt: "_____ allows operating system services to be loaded dynamically.",
    options: ["Virtual machines", "Modules", "File systems", "Graphical user interfaces"], correct: [1],
    explanation: "Loadable kernel modules provide components that communicate through defined interfaces and can be loaded into the kernel as needed.",
    references: ["Ch2 OS Structure.pdf, PDF pages 44, 49"],
    tags: ["chapter-2", "os-architecture", "modules", "slide-exercise"]
  },
  {
    id: "os-e1-c2-07", type: "single", difficulty: "med",
    prompt: "In the simplified boot sequence described in the slides, a boot block ____.",
    options: ["typically only knows the location and length of the rest of the bootstrap program", "typically is sophisticated enough to load the operating system and begin its execution", "is composed of multiple disk blocks", "is composed of multiple disk cylinders"], correct: [0],
    explanation: "The slides describe a small initial stage that locates the next stage, and a disk boot block that knows the location and length of the remainder of the bootstrap program. The prompt explicitly uses this simplified model; real boot implementations can be more capable.",
    references: ["Ch2 OS Structure.pdf, PDF pages 50-51"],
    tags: ["chapter-2", "booting", "slide-exercise"]
  },
  {
    id: "os-e1-c2-08", type: "single", difficulty: "easy",
    prompt: "If a program terminates abnormally, a dump of memory may be examined by a ____ to determine the cause of the problem.",
    options: ["module", "debugger", "shell", "control card"], correct: [1],
    explanation: "A debugger can inspect a memory dump to determine the cause of an abnormal termination. An application failure may produce a core dump of the process's memory.",
    references: ["Ch2 OS Structure.pdf, PDF pages 53, 62"],
    tags: ["chapter-2", "debugging", "slide-exercise"]
  },
  {
    id: "os-e1-c2-09", type: "free", difficulty: "med", homeworkFormat: "multi-step",
    prompt: "Describe a system-call/API sequence for safely copying a source file to a new destination file. Include opening/creating files, the read/write loop, handling a missing source or already-existing destination, the meaning of read() returning a positive value, 0, or -1, and where the OS service executes. Assume POSIX-style read/write calls; explain why a short write cannot be ignored.",
    explanation: "A copy opens the source, creates the destination without overwriting an existing file, transfers exactly the bytes returned by reads, handles errors and partial writes, and closes resources. Library/API invocation occurs in user space; the OS service executes in the kernel.",
    sampleAnswer: "Open the source for reading and report failure if it does not exist. Create the new destination while refusing to overwrite an existing file. Repeatedly call read(fd, buffer, count). A positive return n means n bytes were read; write exactly those n bytes, repeating writes if only part of them was written. A return of 0 is EOF and ends a successful copy; -1 is an error that must be reported rather than treated as successful completion. Also detect destination-creation and write errors. Close both files on completion or failure, and only report success after the transfer and required cleanup succeed. The application calls an API/library wrapper from user mode; the requested service runs in kernel mode and returns its status. The slide's schematic 'until read fails' loop is clarified to separate EOF from an actual error.",
    solutionMd: "1. **Prepare:** acquire the names, open the source, and create a new destination with a no-overwrite rule. Handle failed open/create before copying.\n2. **Read:** `n > 0` means copy exactly `n` bytes; `n == 0` means EOF; `n == -1` means error. The requested `count` is a maximum, not a guarantee.\n3. **Write:** continue until the entire returned chunk is written. A short write transfers fewer bytes than requested; ignoring it would lose data. Treat write failure as failure.\n4. **Finish:** close both files on every exit path. Report success only after successful completion; a partial destination must not be presented as a complete copy.\n5. **Boundary:** the API hides implementation details. Invoking its user-mode wrapper requests a service that executes in the kernel.\n\nThe transfer/error details are additional exam-style practice based on the slide's copy sequence and API contract.",
    hintSteps: ["The file-copy slide checks the source and destination before entering its loop.", "The read API has three distinct outcomes. EOF and an error are not interchangeable.", "If read returns n < count, which number should the next write use? What if write transfers less than n?"],
    walkthroughSteps: ["Open the source and stop on failure; create the destination under a no-overwrite rule and stop on failure.", "Read a chunk and branch on positive byte count, zero EOF, or negative error.", "For a positive result, write only the bytes actually read and retry the remaining part of a short write.", "Handle transfer errors and close both descriptors on success or failure.", "Relate the user-mode API call to the kernel-mode service and returned status."],
    references: ["Ch2 OS Structure.pdf, PDF pages 22-23, 26-29"],
    tags: ["chapter-2", "system-calls", "file-copy", "api", "exam-style"]
  },
  {
    id: "os-e1-c2-10", type: "single", difficulty: "easy",
    prompt: "Touch screen is a user interface on mobile systems.",
    options: ["Yes", "No"], correct: [0],
    explanation: "Touchscreen interfaces use gestures for actions and selection, and can provide virtual keyboards for text entry.",
    references: ["Ch2 OS Structure.pdf, PDF pages 11, 21"],
    tags: ["chapter-2", "user-interface", "slide-exercise"]
  },
  {
    id: "os-e1-c2-11", type: "single", difficulty: "med",
    prompt: "The major difficulty in designing a layered operating system approach is ____.",
    options: ["appropriately defining the various layers", "making sure that each layer hides certain data structures, hardware, and operations from higher-level layers", "debugging a particular layer", "making sure each layer is easily converted to modules"], correct: [0],
    explanation: "The design must assign functionality to layers so dependencies can run through lower layers. Choosing appropriate boundaries is the major design difficulty; layer-by-layer testing is an advantage.",
    references: ["Ch2 OS Structure.pdf, PDF pages 41, 47"],
    tags: ["chapter-2", "os-architecture", "layered", "slide-exercise"]
  },
  {
    id: "os-e1-c2-12", type: "single", difficulty: "easy",
    prompt: "An initial bootstrap program is in the form of random-access memory (RAM).",
    options: ["True", "False"], correct: [1],
    explanation: "In the slides' boot model the initial loader is stored in nonvolatile ROM/firmware, so it is available when power is first applied. Ordinary RAM does not retain it through power loss.",
    references: ["Ch2 OS Structure.pdf, PDF pages 50, 52"],
    tags: ["chapter-2", "booting", "slide-exercise"]
  },
  {
    id: "os-e1-c2-13", type: "single", difficulty: "med",
    prompt: "Debugging is the activity of finding and fixing errors in a system, only in software.",
    options: ["True", "False"], correct: [1],
    explanation: "Debugging is finding and fixing errors. The restriction 'only in software' is false: OS/system failures can also involve hardware faults. The chapter explicitly includes CPU, memory, and I/O hardware in possible error sources.",
    references: ["Ch2 OS Structure.pdf, PDF pages 16, 53, 63"],
    tags: ["chapter-2", "debugging", "slide-exercise"]
  },
  {
    id: "os-e1-c2-14", type: "multi", difficulty: "easy",
    prompt: "Which Linux command/action pairs match the Common Commands slide? Select all that apply.",
    options: ["cat notes.txt: display a text file's contents","cp old.txt new.txt: copy a file","rm notes.txt: rename the file","pwd: print the working directory","ls: list files in a directory"], correct: [0,1,3,4],
    explanation: "pwd prints the current directory, ls lists files, cat displays text, and cp copies. rm removes a file; mv is used to rename or move one. The Windows counterparts shown include dir, type, and copy.",
    references: ["Ch2 OS Structure.pdf, PDF page 8"],
    tags: ["chapter-2", "user-interface", "cli", "exam-style"]
  },
  {
    id: "os-e1-c2-15", type: "single", difficulty: "easy",
    prompt: "What is the role of a command-line interpreter, and can an OS offer both a CLI and a GUI?",
    options: ["It executes all typed commands with unrestricted kernel privileges; GUI support disables it","It is the kernel itself; applications cannot provide an alternative command interpreter","It accepts typed commands and requests their execution; the OS can offer both CLI and GUI","It translates source code into object files; offering a GUI prevents command-line use"], correct: [2],
    explanation: "A command-line interpreter is a program that accepts commands and calls on the OS to run them. The slides give Windows, macOS, and Linux as systems offering both kinds of interface.",
    references: ["Ch2 OS Structure.pdf, PDF pages 4, 7, 9-11"],
    tags: ["chapter-2", "user-interface", "cli", "exam-style"]
  },
  {
    id: "os-e1-c2-16", type: "multi", difficulty: "med",
    prompt: "Which are user-oriented OS services described in the chapter? Select all that apply.",
    options: ["Load, run, and terminate a program", "Read/write files and manage directories", "Communicate through shared memory or message passing", "Detect CPU, memory, I/O-device, or user-program errors and respond appropriately", "Require each application to implement its own physical disk controller"], correct: [0, 1, 2, 3],
    explanation: "Program execution, I/O, file-system manipulation, communication, and error detection are OS services. The OS coordinates devices rather than making every application independently manage the hardware.",
    references: ["Ch2 OS Structure.pdf, PDF pages 3, 12-16"],
    tags: ["chapter-2", "os-services", "exam-style"]
  },
  {
    id: "os-e1-c2-17", type: "single", difficulty: "med",
    prompt: "An OS chooses which job receives CPU time and records how much CPU time each job used. Which service pair describes these activities, in order?",
    options: ["Resource allocation, accounting", "Accounting, resource allocation", "Program execution, error detection", "Communication, protection"], correct: [0],
    explanation: "Resource allocation distributes CPU cycles, memory, storage, and devices among concurrent work. Accounting/logging tracks what resources programs consume.",
    references: ["Ch2 OS Structure.pdf, PDF pages 17-19"],
    tags: ["chapter-2", "os-services", "resource-allocation", "exam-style"]
  },
  {
    id: "os-e1-c2-18", type: "multi", difficulty: "med",
    prompt: "Which operation/system-call-category pairs match the examples in the slides? Select all that apply.",
    options: ["Send/receive messages: communications","Set file permissions: protection","Create a process: graphical user interface","Create or terminate a process: process control","Open, read, write, or close a file: file management","Request or release an I/O device: device management","Get the system time/date: information maintenance"], correct: [0,1,3,4,5,6],
    explanation: "The chapter lists process control, file management, device management, information maintenance, communications, and protection as system-call categories. GUI is a user-interface style rather than one of these categories.",
    references: ["Ch2 OS Structure.pdf, PDF pages 23-25"],
    tags: ["chapter-2", "system-call-categories", "exam-style"]
  },
  {
    id: "os-e1-c2-19", type: "single", difficulty: "med",
    prompt: "For the API `ssize_t read(int fd, void *buf, size_t count)`, which statement is correct?",
    options: ["buf must be a filename, and count specifies the total number of open files","A successful call always returns count, even at end of file","fd identifies an open file, buf receives data, count is the maximum requested byte count, and -1 signals an error","fd is the number of bytes to read, and a return of 0 always means error"], correct: [2],
    explanation: "The illustrated read API uses a file descriptor, a destination buffer, and a maximum byte count. It returns bytes actually read; 0 means EOF and -1 indicates error. The declaration uses int fd, despite the slide's nearby informal 'unsigned integer' wording.",
    references: ["Ch2 OS Structure.pdf, PDF page 27"],
    tags: ["chapter-2", "api", "file-descriptors", "exam-style"]
  },
  {
    id: "os-e1-c2-20", type: "single", difficulty: "med",
    prompt: "A system call needs more parameters than fit in the available argument registers. Which slide-listed approach avoids that register-count limit?",
    options: ["Silently omit the arguments that do not fit","Encode the arguments using the cache replacement order","Let the user program directly overwrite the kernel's private argument variables","Store the parameters in a memory block and pass the block's address in a register"], correct: [3],
    explanation: "A register can hold a pointer to a larger parameter block. The other listed alternative is placing arguments on the stack. Both avoid constraining the argument count to the number of argument registers, although available memory is still finite.",
    hintSteps: ["A pointer can name a block containing many values."],
    walkthroughSteps: ["Registers alone can pass only as many directly stored values as the interface makes available.", "Lay out the full argument list in memory.", "Pass its address in one register so the OS can access all entries."],
    references: ["Ch2 OS Structure.pdf, PDF page 30"],
    tags: ["chapter-2", "parameter-passing", "exam-style"]
  },
  {
    id: "os-e1-c2-21", type: "single", difficulty: "med",
    prompt: "Which sequence correctly identifies compilation, linking, and loading?",
    options: ["Compile source to relocatable object files → link objects/libraries into an executable → load the executable into memory", "Compile source to object files → load the objects as the final program → link after execution ends", "Link source code into object files → compile the executable → load libraries only after termination", "Load source to produce object files → link while executing source → compilation places the final program on disk"], correct: [0],
    explanation: "Compilation produces object files. The linker combines objects and needed libraries into a binary executable on secondary storage. The loader brings that executable into memory for execution; dynamically linked libraries can be loaded as needed.",
    references: ["Ch2 OS Structure.pdf, PDF pages 33-34"],
    tags: ["chapter-2", "linking-loading", "exam-style"]
  },
  {
    id: "os-e1-c2-22", type: "single", difficulty: "easy",
    prompt: "Which pairing correctly distinguishes OS user goals from system goals?",
    options: ["User: implement the scheduler; system: choose application document formatting","User: convenient and easy to learn; system: easy to implement and maintain","User: easy to maintain kernel code; system: easy for beginners to learn the interface","User: only binary-file size; system: only desktop icon layout"], correct: [1],
    explanation: "User goals emphasize convenient, learnable, reliable, safe, fast use. System goals include maintainability, flexibility, reliability, and efficient implementation. Some qualities, such as reliability, overlap.",
    references: ["Ch2 OS Structure.pdf, PDF page 36"],
    tags: ["chapter-2", "os-design", "exam-style"]
  },
  {
    id: "os-e1-c2-23", type: "single", difficulty: "easy",
    prompt: "Which implementation pattern and benefit are described in the OS implementation slides?",
    options: ["Portable high-level code removes the need for any architecture-specific low-level code","Using a high-level language guarantees faster execution on all hardware","Low-level parts may use assembly and the main body C; higher-level languages aid understanding, debugging, and portability","The main OS body is usually assembly and higher-level languages are used only in device firmware"], correct: [2],
    explanation: "OS implementations often mix languages. The slides place the lowest levels in assembly, the main body in C, and system programs in various languages. Higher-level code can improve development, debugging, and portability without guaranteeing runtime speed.",
    references: ["Ch2 OS Structure.pdf, PDF page 37"],
    tags: ["chapter-2", "os-implementation", "exam-style"]
  },
  {
    id: "os-e1-c2-24", type: "single", difficulty: "med",
    prompt: "Which statement describes the original UNIX monolithic kernel structure in the slides?",
    options: ["All nonessential services run in separate user-space servers using message passing","Every service occupies a strict layer and can only invoke the next lower layer","All functions are loaded only as user-mode modules and share no privileged address space","Many OS functions run together in a single kernel address space, enabling fast internal communication but packing much functionality into one level"], correct: [3],
    explanation: "The original UNIX kernel lies below the system-call interface and above hardware, providing file systems, scheduling, memory management, and other functions. The single-address-space structure gives fast communication with a large amount of functionality in one layer.",
    references: ["Ch2 OS Structure.pdf, PDF pages 39-40"],
    tags: ["chapter-2", "os-architecture", "monolithic", "exam-style"]
  },
  {
    id: "os-e1-c2-25", type: "multi", difficulty: "med",
    prompt: "Which statements about the layered OS approach match the slides? Select all that apply.",
    options: ["Layers are built and tested from lower layers upward","Layer-by-layer construction can make debugging easier","Passing through layers can add overhead","Every layer can depend arbitrarily on all higher layers while preserving strict layering","Layer 0 is hardware and the highest layer is the user interface"], correct: [0,1,2,4],
    explanation: "Layers build on lower layers; defined dependency boundaries support incremental testing. Extra traversal can reduce efficiency, and unrestricted dependence on higher layers undermines the approach.",
    references: ["Ch2 OS Structure.pdf, PDF page 41"],
    tags: ["chapter-2", "os-architecture", "layered", "exam-style"]
  },
  {
    id: "os-e1-c2-26", type: "single", difficulty: "med",
    prompt: "A file service is moved out of the kernel into a user-level server in a microkernel design. Which tradeoff best matches the slides?",
    options: ["The move always improves runtime performance because additional mode transitions are free","Less code runs in kernel mode and extension may be easier, but message passing and user/kernel communication add overhead","The move eliminates communication costs because user-space servers need no kernel mediation","The service must now execute in the same privileged address space as all other services"], correct: [1],
    explanation: "Microkernels move nonessential services to user space, reducing the amount of privileged kernel code and easing extension. Communication between modules through messages incurs overhead.",
    references: ["Ch2 OS Structure.pdf, PDF pages 42-43"],
    tags: ["chapter-2", "os-architecture", "microkernel", "exam-style"]
  },
  {
    id: "os-e1-c2-27", type: "single", difficulty: "med",
    prompt: "A kernel keeps a monolithic core but dynamically loads functionality using defined module interfaces. How should it be described using the chapter's categories?",
    options: ["A strictly layered OS because every component must call only the next lower layer","A user-space server design because loadable modules always execute outside the kernel","A combination of monolithic and modular approaches, as illustrated by Linux","A pure microkernel solely because its components can be loaded dynamically"], correct: [2],
    explanation: "The chapter emphasizes hybrid combinations. Linux is presented as monolithic plus modular; loadable kernel modules still execute within the kernel rather than necessarily as user-space servers.",
    references: ["Ch2 OS Structure.pdf, PDF pages 44-46"],
    tags: ["chapter-2", "os-architecture", "hybrid", "modules", "exam-style"]
  },
  {
    id: "os-e1-c2-28", type: "multi", difficulty: "easy",
    prompt: "Which capabilities or steps are part of the chapter's OS boot model? Select all that apply.",
    options: ["Boot loaders can support single-user or recovery boot states","The OS must already be executing in user RAM before any loader can run","Execution begins at a fixed memory location when power is initialized","An initial nonvolatile loader locates another boot stage on disk","A boot loader may select among kernels or kernel options"], correct: [0,2,3,4],
    explanation: "The initial firmware stage is available before the kernel is loaded. Further stages locate/load the OS and can provide kernel selection or recovery options.",
    references: ["Ch2 OS Structure.pdf, PDF page 50"],
    tags: ["chapter-2", "booting", "exam-style"]
  },
  {
    id: "os-e1-c2-29", type: "multi", difficulty: "med",
    prompt: "Which debugging/performance pairs match the slides? Select all that apply.",
    options: ["Profiling: periodic sampling to identify statistical trends","Performance tuning: identify and remove bottlenecks","Trace listing: guarantees every recorded event is a software bug","Application failure: core dump capturing process memory","OS failure: crash dump capturing kernel memory"], correct: [0,1,3,4],
    explanation: "Core and crash dumps capture different execution contexts. Profiling samples behavior, while tracing records selected activities. Either can help diagnosis, but an observed event is not necessarily an error.",
    references: ["Ch2 OS Structure.pdf, PDF pages 53-57"],
    tags: ["chapter-2", "debugging", "performance", "exam-style"]
  },
  {
    id: "os-e1-c2-30", type: "multi", difficulty: "med",
    prompt: "Which tool/purpose pairs match the tracing slide? Select all that apply.",
    options: ["gdb: source-level debugging","perf: Linux performance analysis tools","tcpdump: capture network packets","tcpdump: link relocatable object files into an executable","strace: trace system calls invoked by a process"], correct: [0,1,2,4],
    explanation: "The chapter maps strace to system calls, gdb to source debugging, perf to performance tools, and tcpdump to network packets. Linking is the linker's job.",
    references: ["Ch2 OS Structure.pdf, PDF pages 57-61"],
    tags: ["chapter-2", "debugging", "tracing-tools", "exam-style"]
  },
  {
    id: "os-e1-c2-31", type: "free", difficulty: "med", homeworkFormat: "short",
    prompt: "Compare monolithic, layered, microkernel, and modular OS structures. For each, explain where services live or how they are organized and give one advantage or tradeoff. Explain why a loadable kernel module is not automatically a user-space microkernel service.",
    explanation: "The structures differ in service placement and dependency boundaries. Modules may be loaded dynamically while remaining in kernel space; microkernel services are largely moved to user-level programs and communicate via messages.",
    sampleAnswer: "A monolithic kernel puts many OS services in one kernel address space, making communication fast but packing much functionality into a large privileged layer. A layered OS builds higher layers on lower ones, with hardware at the bottom and a user interface at the top; this supports incremental testing but choosing layers is difficult and traversal adds overhead. A microkernel keeps essential kernel functions and moves other services into user-space servers; it is easier to extend and has less privileged code, but messages and user/kernel transitions cost time. A modular kernel has separate components with known interfaces that are loadable as needed within the kernel. A loadable module therefore remains privileged kernel code; dynamic loading alone does not make it an isolated user-space server. Modern systems can combine these approaches.",
    solutionMd: "| Structure | Organization | Principal tradeoff |\n|---|---|---|\n| Monolithic | Many services in one kernel address space | Fast communication; much functionality in one privileged level |\n| Layered | Each layer builds on lower ones | Incremental testing; hard boundary design and traversal overhead |\n| Microkernel | Essential kernel plus user-level service programs | Less kernel code and easier extension; communication overhead |\n| Modular | Components with known interfaces load into the kernel as needed | Flexible addition; modules remain privileged kernel code |\n\n**Key distinction:** loadability is about when code is installed; user/kernel placement is about where it executes. Modern kernels can combine monolithic and modular features.",
    hintSteps: ["For each structure, identify both the service location and how components communicate.", "Does a loadable kernel module run inside or outside the kernel?", "Use the slide's benefit/disadvantage pairs rather than treating one design as universally best."],
    walkthroughSteps: ["Describe monolithic service placement and its fast internal communication.", "Describe layered dependencies, incremental testing, and possible overhead.", "Describe microkernel movement of services to user space and message-passing costs.", "Describe defined interfaces and dynamic loading of components into a modular kernel.", "Separate dynamic loading from user-space placement and explain that hybrid systems combine features."],
    references: ["Ch2 OS Structure.pdf, PDF pages 38-46"],
    tags: ["chapter-2", "os-architecture", "monolithic", "layered", "microkernel", "modules", "exam-style"]
  },
  {
    id: "os-e1-c2-32", type: "free", difficulty: "med", homeworkFormat: "multi-step",
    prompt: "A Linux application crashes during one run; in another run it stays alive but responds slowly, and you suspect network activity or repeated system calls. Propose a focused diagnosis plan using logs, dumps, profiling/tracing, and the chapter's tools. Distinguish what you would collect for an application crash from an OS crash.",
    explanation: "Use process core dumps and a debugger for application failures, kernel crash dumps for OS failures, and targeted performance tools for slowness. Tracing system calls and packets answers different questions than periodic profiling.",
    sampleAnswer: "First inspect logs for error details and the failure context. For an application crash, inspect its core dump with a debugger such as gdb; it captures process memory. For an OS crash, use a crash dump containing kernel memory. For a live but slow application, measure behavior and use perf/profiling to sample where time is spent and identify bottlenecks. Use strace if the hypothesis is repeated or blocking system calls, and tcpdump if it concerns network packet behavior. Tracing collects details about selected events, while profiling periodically samples to reveal statistical trends. Choose the tool that tests the suspected cause and interpret the evidence rather than assuming all slowness is a crash.",
    solutionMd: "1. **Logs:** collect error/context information before choosing a hypothesis.\n2. **Application crash:** preserve a process core dump and inspect it with a debugger such as `gdb`.\n3. **OS crash:** inspect a kernel crash dump; this is different from an application's core dump.\n4. **Slowness:** measure behavior and identify the bottleneck. Use `perf` for performance investigation, including profiling.\n5. **Specific hypotheses:** use `strace` for system-call activity and `tcpdump` for packets.\n6. **Interpretation:** tracing follows selected events; profiling samples periodically to reveal trends. Evidence determines what to fix.",
    hintSteps: ["Ask whether the failure concerns one process or the kernel before choosing a dump.", "Which tool observes system calls, and which observes packets?", "A slow live process may need measurements instead of a post-crash dump."],
    walkthroughSteps: ["Begin with logs to learn when and how the error or slowdown occurred.", "Select a core dump for application failure and a kernel crash dump for OS failure.", "Use gdb to inspect application state and the cause of abnormal termination.", "For the live slowdown, gather measurements and use profiling/perf to locate time-consuming work.", "Trace system calls with strace or packets with tcpdump when those observations test the hypothesis."],
    references: ["Ch2 OS Structure.pdf, PDF pages 53-61"],
    tags: ["chapter-2", "debugging", "performance", "tracing-tools", "exam-style"]
  }
];
